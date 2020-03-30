FROM python:3.7.7-alpine

RUN pip3 --no-cache-dir install elasticsearch-curator==5.8.1

ENTRYPOINT [ "/usr/local/bin/curator_cli" ]
