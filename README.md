# Elastic Stack Monitoring
## Kibana-like multi-cluster monitoring for elasticsearch.

<br />

First things first: **Why not Kibana?**

The answer to that is: If you have the money for it, use Kibana.

BUT if you're a small-to-medium sized business running a small number of elastic clusters and want multi-cluster monitoring, you probably already know that you need at least a gold+ licence, which will set you back around £4,500 *per node, per year*.

Multi-cluster monitoring might be the only part of elastic stack gold licence you want, and you don't have an infrastructure big enough to warrant paying that price.

So in that very specific situation: use this instead of kibana. <br />
It does the same thing, and it's free.

Take a look and see for yourself:
[ANIMATED GIF OF USAGE IN HERE]

## How does it work?
This is just a React UI, served up by nginx that also reverse proxies API requests to a target kibana backend. 

It uses the same backend as the kibana UI does, so all the data being displayed is the same.

The nginx is required to reverse proxy in order to get around the fact that the kibana backend doesn't support `OPTIONS`-type requests. It also helps with getting around some CORS stuff.

## What do I need to do to get it set up?

### 1. Ship your monitoring data to a monitoring cluster
First of all, you should be shipping your monitoring data off-cluster on all your elastic clusters using metricbeat. 

For each elastic cluster, configure metricbeat with the elasticsearch-xpack module reading from the local cluster and configuring `output.elasticsearch` `hosts` to point to your monitoring cluster.

You can do this either once (with `scope: cluster`) and use a load balancer for the entire cluster, or do it once per elasticsearch node (with `scope: node`). [Read the docs for more](https://www.elastic.co/guide/en/beats/metricbeat/current/metricbeat-module-elasticsearch.html). You get mostly the same data in each case, except that, for the cluster scoped setup, the transport address at the node-level in the UI will show the load balancer's address for every node in the cluster, rather than the actual transport address of the nodes.

### 2. Configure the .args and build the container
You need to create a file called `.args` in this repo directory. It should contain three properties:

1. TARGET_KIBANA_URL - the URL of the kibana backend uncluding port
2. TARGET_KIBANA_VERSION - the version of the kibana backend you're targeting
3. LISTEN_ON_PORT - the port to run elastic stack monitoring app on

 [See .args-example for more](./.args-example).

Once you've created this file, run:

    ./docker/build.sh

This will build this app and create a docker container image called `esm-proxy`.

You can run it locally, if you have access to the `TARGET_KIBANA_URL` by running:

    ./docker/run.sh

This will also open a browser window to the app.

## Supported Versions

Currently this has only been tested on v7.17.0 and v7.8.0 clusters. I'm planning on introducing some cypress tests using testcontainers to test it on more versions automatically, but the setup is tough, so it's taking a while. 

If you have a different version cluster, try it and see. Let me know how it goes.

## Wishlist
Here are a bunch of things this app could benefit from if you wanted to contribute:

1. Alerts
2. Automated testing against multiple kibana backends
3. Authentication
4. Replace docker container args with run-time environment variables

# Let's talk about 💷

This is an open source project. You are, of course, welcome to use it ✨ for free ✨.

If you're a business (highly likely) and you're using this as part of your monitoring solutions, the I'd like to appeal to your better nature and ask you to consider donating to my cause (which is mostly about paying for my kids' swimming lessons and stuff like that). <br />
Every little helps, and this app *is* saving you upwards of £4,500 *per node, per year* afterall 😉 <br />
If you decide to help a guy out, you can find my sponsorship link on the side and, from the bottom of my heart: thank you 🙏. It _is_ appreciated.