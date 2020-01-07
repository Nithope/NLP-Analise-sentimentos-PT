from pony import orm


db = orm.Database()


class Twetext(db.Entity):
    twetext= orm.Required(str)

db.bind('sqlite', '/home/nikolas/Desktop/N\'s Stuff/datascience/NLP/sentiment analysis/analise de sentimentos/dataset-master/twetext.sqlite', create_db=True)
db.generate_mapping(create_tables=True)

@orm.db_session
def add_tweet(tweet):
    tweet = Twetext(twetext=tweet)
    orm.commit()
