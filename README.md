# Receipt processor

## How to start 💻

These steps assume you have Podman, Docker, or another container runtime available.

Via Compose:
1. `docker compose up -d`

Yourself:
1. Clone repository: `git clone https://github.com/OutdatedVersion/receipt-processor-exercise.git`
1. Build image: `docker image build -t receipt-thing .`
1. Start container: `docker run --rm -p 2000:2000 receipt-thing`
1. Verify: `curl 127.0.0.1:2000/health`

### Running the tests

If you have Node.js/npm installed, you can run the automated tests locally:

1. `npm test`
1. `npm run test:integration`

If not, manual testing or checking the latest GitHub Actions run works too! :)
