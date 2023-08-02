# End-to-End Example of Splitgraph, Seafowl and Madatdata

This is a full, end-to-end example built with Next.js that uses [madatdata][madatdata-repo],
[Splitgraph][splitgraph-home] and [Seafowl][seafowl-home]. It renders a website
where users can import GitHub repository data into Splitgraph, and then export
that data to Seafowl, and query it directly from the client. In doing so,
it demonstrates:

- Importing data to Splitgraph (using the `airbyte-github` madatdata plugin)
- Exporting it to Seafowl (using the `export-to-seafowl` madatdata plugin)
- And then querying it, at both Splitgraph DDN and `demo.seafowl.cloud`, sending
  queries directly from the client with `@madatdata/react` and `useSql`

The example uses Next.js with backend routes that call the Splitgraph API to trigger
data import (from GitHub) and data export (to Seafowl). The client side pages query
Seafowl and Splitgraph DDN directly by sending raw SQL queries in HTTP requests,
which is what both Splitgraph and Seafowl are ultimately designed for.

## Try Now

### Preview Immediately

_No signup required, just click the button!_

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/splitgraph/demo-github-analytics/tree/main?file=pages/index.tsx)

[![Open with CodeSandbox](https://assets.codesandbox.io/github/button-edit-lime.svg)](https://codesandbox.io/p/sandbox/github/splitgraph/demo-github-analytics/main?file=pages/index.tsx&hardReloadOnChange=true&startScript=dev&node=16&port=3000)

### Or, deploy to Vercel (signup required)

_Signup, fork the repo, and import it_

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/git/external?repository-url=https://github.com/splitgraph/demo-github-analytics/tree/main&project-name=splitgraph-seafowl-madatdata-demo&repository-name=splitgraph-seafowl-madatdata-demo)

## Local Development

### Make sure you're using Yarn Berry

Make sure your local Yarn executable is set to Yarn Berry, so that it will read
from `.yarnrc.yml` which will direct it to use the executable in `.yarn/releases`,
which at the moment of writing is version `3.2.1`

```bash
yarn set version berry
```

Sanity check, `yarn --version` should be `3.2.1`:

```bash
yarn --version
# 3.2.1
```

Also make sure you're using Node v18+:

```bash
node --version
# v18.10.0
```

<details>

<summary>Install latest `node` with `nvm`, and then install `yarn` as global package</summary>

You can use `nvm` to install the latest Node version (assuming you've setup `nvm`):

```bash
nvm install
nvm use
npm install -g yarn
```

Note: When calling `nvm install`, you can tell it to [migrate global packages][github-nvm-migrate-global-packages]
from your current version to the new version, which could save you from
running `npm install -g yarn`, if for some reason this is easier for you:

```bash
nvm install --reinstall-packages-from=current
nvm use
```

</details>

### Install

To install using the same versions of all packages as listed in the lockfile:

```bash
yarn install --immutable
```

### Configure

You will need:

- Splitgraph API key and secret ([manage credentials][splitgraph-manage-credentials])
- Splitgraph namespace to use (it should be your username)
- GitHub Personal Access Token ([get one][create-github-pat])

The specific environment variable keys are documented via comments in the `.env.test.local`
file, which you should copy to the (ignored) path of `.env.local`:

```bash
cp .env.test.local .env.local
```

Then, edit the `.env.local` file to insert the appropriate values for the required
variables.

### Run

To run in development mode:

```bash
yarn dev
```

---

[madatdata-repo]: https://github.com/splitgraph/madatdata
[splitgraph-home]: https://www.splitgraph.com
[seafowl-home]: https://seafowl.io
[github-nvm-migrate-global-packages]: https://github.com/nvm-sh/nvm#migrating-global-packages-while-installing
[splitgraph-manage-credentials]: https://www.splitgraph.com/connect/query
[create-github-pat]: https://github.com/settings/personal-access-tokens/new
