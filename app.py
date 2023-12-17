from flask import Flask, request, jsonify, render_template
from urllib.parse import unquote_plus
from datetime import datetime

__version__ = 1.2

app=Flask(__name__)
app.config['SECRET_KEY'] = 'ighirgiihigh4i3ig43itiheifuhewi'

@app.route('/', methods=['GET', 'POST'])
def home():
    return render_template('home.html')

@app.route('/fb24hactive', methods=['GET', 'POST'])
def fb_active():
    return render_template('fbactive.html')

@app.route('/smsbomber', methods=['GET'])
def sms_bomber():
    task_id = request.args.get('task_id')
    return render_template('smsbomber.html', task_id=task_id)

@app.route('/gdrive-directlink', methods=['GET', 'POST'])
def gdirect_link():
    return render_template('gdirectlink.html')

@app.context_processor
def jinja_global_variables():
    return dict(version=__version__, year=datetime.now().year)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=80, debug=True)
