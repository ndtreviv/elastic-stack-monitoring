const isDev = parseInt((document.location.port || '80'), 10) >= 3000;
const baseURL = isDev ? `${document.location.origin.replace(':' + document.location.port, '')}` : document.location.origin;

export async function listClusters ({ from, to }) {
  const body = {
    timeRange: {
      min: from.format(),
      max: to.format()
    },
    codePaths: [
      'license'
    ]
  };

  const response = await window.fetch(`${baseURL}/api/monitoring/v1/clusters`, {
    body: JSON.stringify(body),
    method: 'POST'
  });

  return response.json();
}

export async function listClusterIndices (clusterUuid, { from, to }, showSystemIndices) {
  const body = {
    timeRange: {
      min: from.format(),
      max: to.format()
    }
  };

  const response = await window.fetch(`${baseURL}/api/monitoring/v1/clusters/${clusterUuid}/elasticsearch/indices?show_system_indices=${showSystemIndices}`, {
    body: JSON.stringify(body),
    method: 'POST'
  });

  return response.json();
}

export async function getClusterOverviewData (cluster, { from, to }) {
  const body = {
    timeRange: {
      min: from.format(),
      max: to.format()
    }
  };

  const response = await window.fetch(`${baseURL}/api/monitoring/v1/clusters/${cluster}/elasticsearch`, {
    referrer: 'https://metrics.cameraforensics.com:5601/app/monitoring',
    referrerPolicy: 'no-referrer-when-downgrade',
    body: JSON.stringify(body),
    method: 'POST'
  });
  return response.json();
}

export async function listNodes (cluster, { from, to }) {
  const body = {
    timeRange: {
      min: from.format(),
      max: to.format()
    },
    pagination: {
      size: 20,
      index: 0
    },
    sort: {
      field: 'name',
      direction: 'asc'
    },
    queryText: ''
  };

  const response = await window.fetch(`${baseURL}/api/monitoring/v1/clusters/${cluster}/elasticsearch/nodes`, {
    referrer: 'https://metrics.cameraforensics.com:5601/app/monitoring',
    referrerPolicy: 'no-referrer-when-downgrade',
    body: JSON.stringify(body),
    method: 'POST'
  });
  return response.json();
}

export async function getNodeData (clusterUuid, nodeUuid, { from, to }, isAdvanced) {
  const body = {
    showSystemIndices: false,
    timeRange: {
      min: from.format(),
      max: to.format()
    },
    is_advanced: Boolean(isAdvanced)
  };

  const response = await window.fetch(`${baseURL}/api/monitoring/v1/clusters/${clusterUuid}/elasticsearch/nodes/${nodeUuid}`, {
    referrer: 'https://metrics.cameraforensics.com:5601/app/monitoring',
    referrerPolicy: 'no-referrer-when-downgrade',
    body: JSON.stringify(body),
    method: 'POST'
  });

  return response.json();
}

export async function getIndexData (clusterUuid, index, { from, to }, isAdvanced) {
  const body = {
    timeRange: {
      min: from.format(),
      max: to.format()
    },
    is_advanced: Boolean(isAdvanced)
  };

  const response = await window.fetch(`${baseURL}/api/monitoring/v1/clusters/${clusterUuid}/elasticsearch/indices/${index}`, {
    referrer: 'https://metrics.cameraforensics.com:5601/app/monitoring',
    referrerPolicy: 'no-referrer-when-downgrade',
    body: JSON.stringify(body),
    method: 'POST'
  });

  return response.json();
}

export async function getShardData (clusterUuid, nodeUuids, { from, to }) {
  const body = {
    showSystemIndices: false,
    timeRange: {
      min: from.format(),
      max: to.format()
    },
    is_advanced: false
  };

  const promises = [];
  nodeUuids.forEach(nodeUuid => {
    promises.push(
      window.fetch(`${baseURL}/api/monitoring/v1/clusters/${clusterUuid}/elasticsearch/nodes/${nodeUuid}`, {
        referrer: 'https://metrics.cameraforensics.com:5601/app/monitoring',
        referrerPolicy: 'no-referrer-when-downgrade',
        body: JSON.stringify(body),
        method: 'POST'
      })
    );
  });

  const shardData = await Promise.allSettled(promises).then(results => {
    const allShardData = Promise.all(results.filter(result => result.status === 'fulfilled').map(result => result.value.json()))
      .then(responses => {
        const allShards = responses.flatMap(response => response.shards);
        let allShardStats = {};
        responses.forEach(response => {
          allShardStats = { ...allShardStats.indices, ...response.shardStats.indices };
        });
        return { shards: allShards, shardStats: { indices: allShardStats } };
      });
    return allShardData;
  });

  return shardData;
}
