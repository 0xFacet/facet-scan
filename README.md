## Getting Started

### Environment Setup

Before starting the development server, you need to set up the environment variables. Create a `.env` file in the root directory of this project. You can take reference from the `.sample.env` file which looks like this:

```
NEXT_PUBLIC_NETWORK=goerli
NEXT_PUBLIC_API_BASE_URI=https://goerli-api.ethscriptionsvm.com
```

If you decide to clone the `ethscriptions-vm-api` repo and get the API running on your local machine, replace `https://goerli-api.ethscriptionsvm.com` in the `.env` file with your localhost URL.

### Running the Development Server

Once the environment is set up:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

## Learn More

To learn more about this stack, take a look at the following resources:

- [Ethscriptions VM Documentation](https://docs.ethscriptions.com/v/ethscriptions-vm) - Learn how to create dumb contracts.
- [Ethscriptions Discord](https://discord.gg/ethscriptions) - Join our community of builders!
