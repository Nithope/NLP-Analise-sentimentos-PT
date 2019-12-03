const Twitter = require('twitter');
const axios = require('axios')

module.exports = (app, io) => {
    let twitter = new Twitter({
        consumer_key: '',
        consumer_secret: '',
        access_token_key: '',
        access_token_secret: ''
    });

    let socketConnection;
    let twitterStream;

    app.locals.searchTerm = ''; //Default search term for twitter stream.
    app.locals.showRetweets = false; //Default

    /**
     * Resumes twitter stream.
     */
    const stream = () => {
	if (app.locals.searchTerm != ''){
        console.log('Resuming for ' + app.locals.searchTerm);
        twitter.stream('statuses/filter', { track: app.locals.searchTerm, language:'pt' }, (stream) => {
            stream.on('data', (tweet) => {
                console.log(tweet.text);
		axios.post('https://flask-sentiments-chipper-squirrel.mybluemix.net/predict',{full_text:tweet.text})
		      .then((response) => {
			console.log(response.data.Sentiment);
			tweet["sentiment"]=response.data.Sentiment
			socketConnection.emit('tweets', tweet);
			socketConnection.emit("sentiment", tweet+response.data.Sentiment)
		      })

            });

            stream.on('error', (error) => {
                console.log(error);
            });

            twitterStream = stream;
        });
	}
    }

    /**
     * Sets search term for twitter stream.
     */
    app.post('/setSearchTerm', (req, res) => {
        let term = req.body.term;
        app.locals.searchTerm = term;
        if(twitterStream!=null){twitterStream.destroy();}
        stream();
    });

    /**
     * Pauses the twitter stream.
     */
    app.post('/pause', (req, res) => {
        console.log('Pause');
        twitterStream.destroy();
    });

    /**
     * Resumes the twitter stream.
     */
    app.post('/resume', (req, res) => {
        console.log('Resume');
        stream();
    });

    //Establishes socket connection.
    io.on("connection", socket => {
        socketConnection = socket;
        //stream();
        socket.on("connection", () => console.log("Client connected"));
        socket.on("disconnect", () => {console.log("Client disconnected");twitterStream.destroy()});
    });

    /**
     * Emits data from stream.
     * @param {String} msg 
     */
    const sendMessage = (msg) => {
//      if (msg.text.includes('RT')) {
//            return;

        socketConnection.emit("tweets", msg);
//    }
}
}
