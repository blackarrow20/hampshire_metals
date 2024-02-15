FROM python:3.10.5
ARG port
USER root

COPY . /app_folder
WORKDIR /app_folder

ENV PORT=$port

RUN apt-get update && apt-get install -y --no-install-recommends apt-utils \
    && apt-get -y install curl \
    && apt-get install libgomp1

RUN apt-get -y install nano
RUN apt -y install fonts-mplus
COPY ./fonts/. /usr/share/fonts/truetype/armin/

RUN chgrp -R 0 /app_folder \
    && chmod -R g=u /app_folder \
    && pip install pip --upgrade \
    && pip install -r requirements.txt

EXPOSE $PORT

CMD gunicorn --workers=1 --threads=8 --access-logfile - --error-logfile - --log-level debug app:app --bind 0.0.0.0:$PORT --preload