FROM tiangolo/uwsgi-nginx-flask:python3.8
MAINTAINER Vasiliy Pozhinskiy 'vpozhinskii@mail.ru'

ENV FLASKCV_SECRET_KEY=baihrjrjgFEgrTHhobpirejgme
ENV FLASKCV_MAIL_PASSWORD=qwerty123!@#
ENV STATIC_PATH /app/app/static

COPY ./app /app

WORKDIR /app

RUN pip install -r requirements.txt

EXPOSE 80
