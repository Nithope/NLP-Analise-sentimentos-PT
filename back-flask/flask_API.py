import os
import pickle
from flask import Flask
from flask_restful import Resource, Api, reqparse
from flask_cors import CORS
from sklearn.feature_extraction.text import CountVectorizer

app = Flask(__name__)
CORS(app)
api = Api(app)
port=int(os.getenv("PORT",9099))

# Require a parser to parse our POST request.
parser = reqparse.RequestParser()
parser.add_argument("full_text",required=True)
# Unpickle our model so we can use it!
if os.path.isfile("./our_model.pkl"):
  model = pickle.load(open("./our_model.pkl", "rb"))
  cv = pickle.load(open("./our_cv.pkl", "rb"))
else:
  raise FileNotFoundError
class Predict(Resource):
  def post(self):
    args = parser.parse_args()
    new_text = [args["full_text"]]
    print({"Sentiment":(';('if model.predict(cv.transform(new_text)).tolist()[0] == 0 else ';D' ),"Phrase":new_text})
    return ({"Sentiment":(';('if model.predict(cv.transform(new_text)).tolist()[0] == 0 else ';D' )})
api.add_resource(Predict, "/predict")
if __name__ == "__main__":
  app.run(host='0.0.0.0',port=port)
