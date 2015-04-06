

The app was created to streamline New York Cares' Annual Winter Wishes program.

## Live Example
Browse the live Winter Wishes App at [http://winterwishes.herokuapp.com](http://winterwishes.herokuapp.com).
For user view access use: WWT and demo2015

## Full-Stack Javascript
The building blocks that assemble this Winter Wishes application: 
* [MongoDB](http://www.mongodb.org/)
* [Express](http://expressjs.com/)
* [AngularJS](http://angularjs.org/)
* [Node.js](http://www.nodejs.org/)
* [MEAN.JS](http://www.meanjs.org/)

## Getting Started
Install Homebrew (http://brew.sh/)

Execute the following commands (for any brew installation, check Caveats section for further instructions)
```
brew install git
brew install node
brew install mongodb
npm install -g bower
npm install -g grunt-cli
```

At the Winter-Wishes root directory, execute the following to install dependencies
```
npm install
```

If you installed mongo through Homebrew, execute the following command to run it in the background
```
mongod --config /usr/local/etc/mongod.conf
```

In a separate terminal, execute the following to run the server:
```
grunt
```

## License
(The MIT License)

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
