# imports 
import os
from flask import Flask, request, make_response
from flask import Blueprint, render_template, redirect, url_for, request, flash
import converter as conv
import speechEmotionRecognition as sp
  
# initializing Flask app 
app = Flask(__name__) 

person1= ''
person2= ''
  

@app.route('/')
def login():
    return render_template('index.html')
    
   
@app.route('/uploadLabel',methods=['GET','POST'])
def uploadLabel():
    try:
        for dirname, dirnames, filenames in os.walk('.'):
            # print path to all subdirectories first.
            for subdirname in dirnames:
                print(os.path.join(dirname, subdirname))

            # print path to all filenames.
            for filename in filenames:
                print(os.path.join(dirname, filename))
        print('ENTREI AQUI')
        isthisFile=request.files.get('file')
        print(isthisFile)
        print(isthisFile.filename)
        isthisFile.save("./input1/"+isthisFile.filename)
        print('guardou')
        global person1, person2
        person1, person2 = conv.converter()
        print("ConvPESSOA1: ", person1)
        print("ConvPESSOA2: ", person2)
        except:
            print('Algo aconteceu')
            
        return redirect(url_for('novo'))


@app.route('/novo')
def novo():
    global person1, person2
    print('NOVO: ', person1)
    print('NOVO2: ', person2) 
    if (person1 and person2) == '':
        person1= 'Ainda não obtido, aguarde'
        person2= 'Ainda não obtido, aguarde'
    print("PESSOA1: ", person1)
    print("PESSOA2: ", person2)
    return render_template('profile.html', p1=person1, p2=person2)

if __name__ == "__main__": 
    # serving the app directly 
    app.run(host='0.0.0.0', port=8080, debug=True)
