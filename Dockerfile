FROM gcr.io/google-appengine/python

# Create a virtualenv for dependencies. This isolates these packages from
# system-level packages.
# Use -p python3 or -p python3.7 to select python version. Default is version 2.
RUN virtualenv /env -p python3.7

# Setting these environment variables are the same as running
# source /env/bin/activate.
ENV VIRTUAL_ENV /env
ENV PATH /env/bin:$PATH

RUN apt-get update -y && apt-get install -y --no-install-recommends build-essential gcc \
                                        libsndfile1 
# Copy the application's requirements.txt and run pip to install all
# dependencies into the virtualenv.
RUN apt-get install -y ffmpeg
ADD requirements.txt /app/requirements.txt
RUN pip install -r /app/requirements.txt
RUN pip install tensorflow 'h5py < 3.0.0'


# Add the application source code.
ADD . /app

# Run a WSGI server to serve the application. gunicorn must be declared as
# a dependency in requirements.txt.
CMD gunicorn -b :$PORT --workers=2 --threads=4 --worker-class=gthread main:app
