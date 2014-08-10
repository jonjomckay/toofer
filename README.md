Toofer
======

Toofer is an AngularJS-based dashboard panel for CoreOS's [fleet](https://github.com/coreos/fleet) system. It uses the (experimental) [HTTP API](https://github.com/coreos/fleet/blob/master/Documentation/api-v1-alpha.md) to interact with the cluster, and is therefore currently fairly limited in it's functionality.

## Setup

1. Clone the repo and enter the application directory

    $ git clone https://github.com/jonjomckay/toofer.git
    $ cd toofer

2. Copy `.env.dist` to `.env` and fill in the placeholders with the relevant values

    $ cp .env.dist .env
    $ nano .env

    COREOS_FLEET_HOST=172.17.8.101
	COREOS_FLEET_PORT=5001

3. Run the node.js server that acts as both a proxy to the HTTP API, and a server for the dashboard

4. Access the dashboard at [http://localhost:3000](http://localhost:3000)

## License

toofer is released under the MIT License. See the LICENSE file for details.

The included dashboard template and associated components are based on @Ehesp's [AngularJS Responsive Dashboard](https://github.com/Ehesp/Responsive-Dashboard) project, which is also released under the MIT License.