<p align="center">
    <h1 align="center">
      <picture>
        <img width="40" alt="Plurality icon." src="https://github.com/Web3-Plurality/zk-onchain-identity-verification/blob/main/dapp-verifier/verifier-app/src/images/plurality.png">
      </picture>
      Plurality
    </h1>
</p>

| Plurality is the first identity-lego-building-block for dapp creators that lets them identify their users without using any third-party KYC provider or other middlemen, whilst preserving the privacy of users. It encourages modular application design, allowing dApp developers to choose and customize the on-chain and off-chain components they need. |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |

# Steps to run Plurality Verifier

We use the `docker-compose.yml` file to bootstrap the verifier for the basic demo. 

1. Create `.env` file from `.env-example`
2. Start the application containers using following command

```
docker-compose up
```

Stop the application containers using following command

```
docker-compose down
```