# set base image (host OS)
FROM python:3.8

RUN rm /bin/sh && ln -s /bin/bash /bin/sh

RUN apt-get -y update
RUN apt-get install -y curl nano wget nginx git build-essential gcc g++ python3-dev \
    libblas-dev liblapack-dev libatlas-base-dev gfortran pkg-config

# Install Node.js 16 (compatible with react-scripts 4.0.1)
RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash - && \
    apt-get install -y nodejs

RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list


# Mongo - Try to install MongoDB (may fail on some architectures, that's OK)
RUN ln -s /bin/echo /bin/systemctl || true
RUN (wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add - && \
     echo "deb http://repo.mongodb.org/apt/debian bullseye/mongodb-org/6.0 main" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list && \
     apt-get -y update && \
     apt-get install -y mongodb-org) || \
    (echo "MongoDB package installation failed - this may be expected on some architectures" && \
     echo "The mongo container may need a different installation method" && true)

# Install Yarn
RUN apt-get install -y yarn

# Upgrade pip but keep it < 24.1 for compatibility with old packages like celery 5.0.5
RUN pip install --upgrade "pip<24.1" setuptools wheel

ENV ENV_TYPE staging
ENV MONGO_HOST mongo
ENV MONGO_PORT 27017
##########

ENV PYTHONPATH=$PYTHONPATH:/src/

# copy the dependencies file to the working directory
COPY src/requirements.txt .

# install dependencies
# On ARM64, numpy 1.19.2 and pandas 1.1.2 don't have wheels, so install compatible versions first
RUN pip install "numpy>=1.19.5,<1.20" "pandas>=1.1.5,<1.2" && \
    sed -i 's/numpy==1.19.2/numpy>=1.19.5,<1.20/' requirements.txt && \
    sed -i 's/pandas==1.1.2/pandas>=1.1.5,<1.2/' requirements.txt && \
    pip install -r requirements.txt
