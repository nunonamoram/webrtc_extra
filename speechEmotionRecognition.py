import shutil
import numpy as np
import keras
import time
import librosa
import os
import matplotlib.pyplot as plt
import tensorflow as tf
import csv
from tensorflow import Graph, Session
from keras.preprocessing import sequence
from keras.models import Sequential
from keras.layers import Dense, Embedding
from keras.utils import to_categorical
from keras.layers import Input, Flatten, Dropout, Activation
from keras.layers import Conv1D, MaxPooling1D
from keras.models import Model
from keras.callbacks import ModelCheckpoint
import sys
import librosa
import bulkDiarize as bk
#model = keras.models.load_model('model/lstm_cnn_rectangular_lowdropout_trainedoncustomdata.h5')

classes = ['Neutral', 'Happy', 'Sad',
           'Angry', 'Fearful', 'Disgusted', 'Surprised']


def predict(folder, classes, model):
    solutions = []
    filenames=[]
    
    for subdir in os.listdir(folder):
        #print(subdir)
        
        lst = []
        predictions=[]
        # print("Sub",subdir)
        filenames.append(subdir)
        for file in os.listdir(f'{folder}{"/"}{subdir}'):
            # print(subdir,"+",file)
            temp = np.zeros((1,13,216))
            X, sample_rate = librosa.load(os.path.join(f'{folder}{"/"}{subdir}{"/"}', file), res_type='kaiser_fast', duration=2.5, sr=22050*2, offset=0.5)
            mfccs = librosa.feature.mfcc(y=X, sr=sample_rate, n_mfcc=13)
            result = np.zeros((13,216))
            result[:mfccs.shape[0],:mfccs.shape[1]] = mfccs
            temp[0] = result
            t = np.expand_dims(temp,axis=3)
            #print(t)
            #model = keras.models.load_model('model/lstm_cnn_rectangular_lowdropout_trainedoncustomdata.h5')
            ans=model.predict_classes(t)
            #print(ans)
            # print("SOL",classes[ans[0]])
            predictions.append(classes[ans[0]])

        if len(predictions) < 2:
            predictions.append('None')    
        solutions.append(predictions)
    return solutions,filenames


#if __name__ == '__main__':
def init():
    INPUT_FOLDER_PATH = "input/"
    OUTPUT_FOLDER_PATH = "output/"
    # bk.diarizeFromFolder(INPUT_FOLDER_PATH,OUTPUT_FOLDER_PATH)
    person1 = ''
    person2 = ''
    for subdir in os.listdir(INPUT_FOLDER_PATH):
        if subdir != 'boon':
            bk.diarizeFromFolder(f'{INPUT_FOLDER_PATH}{subdir}{"/"}',(f'{OUTPUT_FOLDER_PATH}{subdir}{"/"}'))
            print("Diarized",subdir)
            shutil.rmtree(os.path.join(INPUT_FOLDER_PATH, subdir))
    model = keras.models.load_model('model/lstm_cnn_rectangular_lowdropout_trainedoncustomdata.h5')
    folder = OUTPUT_FOLDER_PATH
    for subdir in os.listdir(folder):
        if subdir != 'boon':
            predictions,filenames = predict(f'{folder}{"/"}{subdir}', classes, model)
            # print("filename:",filenames,",Predictions:",predictions)
            with open('SER_'+subdir+'.csv', 'w') as csvFile:
                writer = csv.writer(csvFile)
                for i in range(len(filenames)):
                    csvData = [filenames[i], 'person01',predictions[i][0],'person02',predictions[i][1]]
                    print("filename:",filenames[i],",Predicted Emotion := Person1:",predictions[i][0],",Person2:",predictions[i][1])
                    person1= predictions[i][0]
                    person2= predictions[i][1]
                    writer.writerow(csvData)
            csvFile.close()
            shutil.rmtree(os.path.join(OUTPUT_FOLDER_PATH, subdir))
        
    os.remove("filterTemp.wav")
    return person1, person2
