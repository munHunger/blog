---
title: 'Closet serverless'
image: '/blog/knative/header.jpg'
created: 2023-02-22
summary: Hosting serverless applications outside of cloud on a home server.
tags:
  - 'k8s'
  - 'knative'
  - 'github pages'
---

# Github pages

Lately I've been using [github pages](https://pages.github.com/) a lot, and I would recomend anyone who isn't using it to start using it.
It saves you the hassle of having to get hardware to host a server, scaling if you get a lot of users (not that I do), and general avalability which you usually don't get with your run of the mill at home closet servers.

In fact I host this blog on GH pages and it is dead simple with a github action.
Here is the one I use to push this blog to GH pages

```yaml title=".github/workflows/main.yaml"
name: CI
on:
  push:
    branches: [main]
# Sets permissions of the GITHUB_TOKEN to allow deployment to GitHub Pages
permissions:
  contents: read
  pages: write
  id-token: write

# Allow one concurrent deployment
concurrency:
  group: 'pages'
  cancel-in-progress: true

jobs:
  home:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v3
      - name: Use Node.js 18
        uses: actions/setup-node@v2
        with:
          node-version: 18
      - name: npm install and build
        run: |
          npm install
          npm run build
      - name: Setup Pages
        uses: actions/configure-pages@v2
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v1
        with:
          # Upload entire repository
          path: './build'
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v1
```

But this post is not really about GH pages, it is rather about what to do when you can't use it.

# Serverless backends

So I was writing a time reporting page, because who doesn't love to do time reporting in tons of places!
The plan was to make it sync with github gists, but the problem I ran into was that my frontend couldn't read gists without cors issues.
The solution to this was to host a server that can proxy the requests to the frontend.

Now the issue with that is that I have a bad habbit of creating hobby projects that plain and simply wastes resources by being up all the time.
It might not be a lot, since a node server with no traffic doesn't eat a lot of ram and it doesn't take that much CPU, but it still hurts me a bit to have them just lay there doing nothing.

What I could do to mitigate this is just do a "regular" kubernetes deployment and scale it down to zero when it is not needed, but I fear that one day when I do need it, and I have no access to my cluster to scale it up.

The sane approach is to start using AWS lambda, Azure functions or google cloud functions, as they also scale to zero and cost next to nothing, with the addition of being highly available... but that is not the approach I went with. Instead I installed knative in my k8s cluster.

# Knative

[Knative](https://knative.dev/docs/) is a k8s controller which gives you "serverless" properties on your k8s cluster. Of course it is not serverless as you need your own k8s servers, but you get the point.
You can map a domain to a docker image and knative will spin that container up for you when needed, and kill it after a set time of inactivity.

The deployments are quite easy to setup as well, assuming you aren't doing anything fancy

```yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: timestat
  namespace: timestat
spec:
  template:
    spec:
      containers:
        - image: ghcr.io/munhunger/timestat/kit:{{ .Values.version }}
          ports:
            - containerPort: 3000
```

That piece of config is all that is needed to get a node container available at [https://timestat.home.wunderdev.com/](https://timestat.home.wunderdev.com/), which will get get started when needed and killed after in my case 10 minutes of inactivity.

# microk8s

I was planning on writing this a while ago, but I got into some issues with upgrading my k8s cluster to support a specific version of knative with auto TLS support.
And as it was my third time bricking my k8s cluster during the upgrade I started looking elsewhere as there has to be some k8s installer with sensible defaults.
That search led me to my new favorite piece of software, namely [microk8s](https://microk8s.io/).

It might not be for production, but for my home setup it is amazing.
Dead simple to install, and it has a pretty decent plugin support (knative among others), so you can quickly spin up a node with some cool k8s controllers and get going within an hour!
That is pretty mind boggling, as it usually takes me hours if not days to setup a working k8s cluster (I still have issues with the networking layer).

Just remember if you are using microk8s to create an ingress towards your knative network gateway. That did cause me some headache.

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: kourier-ingress
  namespace: knative-serving
  annotations:
    cert-manager.io/cluster-issuer: lets-encrypt
spec:
  tls:
    - hosts:
        - '*.home.wunderdev.com'
      secretName: home-tls
  rules:
    - host: '*.home.wunderdev.com'
      http:
        paths:
          - backend:
              service:
                name: kourier
                port:
                  number: 80
            path: /
            pathType: Prefix
```

Without it, I had nginx loadbalancer serve all my network request, and it of course had no concept of knative
