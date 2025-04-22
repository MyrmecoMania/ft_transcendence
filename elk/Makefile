# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Makefile                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: pmagnero <pmagnero@student.42.fr>          +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2024/11/27 09:57:34 by pmagnero          #+#    #+#              #
#    Updated: 2025/03/04 10:47:42 by pmagnero         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

COMPOSE_FILE = ./docker-compose.yml
EX_FILEBEAT = ./extensions/filebeat/filebeat-compose.yml
EX_METRICBEAT = ./extensions/metricbeat/metricbeat-compose.yml
ENV = ./.env

all: build run

logs:
	@echo "#####LOGS#####"
	docker --log-level ERROR compose logs

build:
	@echo "Building ELK stack..."
	@mkdir -p ../data/elk
# mkdir -p /home/kek/data/front_data
# mkdir -p /home/kek/data/wordpress
	docker compose -f $(COMPOSE_FILE) -f $(EX_FILEBEAT) -f $(EX_METRICBEAT) build --no-cache

run:
	@echo "Running ELK stack..."
	docker --log-level ERROR compose -f $(COMPOSE_FILE) up setup --remove-orphans -d
	docker --log-level ERROR compose -f $(COMPOSE_FILE) -f $(EX_FILEBEAT) -f $(EX_METRICBEAT) up --remove-orphans -d

stop:
	@echo "Stopping ELK stack..."
	docker compose -f $(COMPOSE_FILE) -f $(EX_FILEBEAT) -f $(EX_METRICBEAT) stop

clean: stop
	@echo "Cleaning ELK stack..."
	docker compose -f $(COMPOSE_FILE) -f $(EX_FILEBEAT) -f $(EX_METRICBEAT) down -v

fclean: clean
	@echo "Resetting everyting, ALL DATAS will be deleted..."
	@if [ -n "$$(sudo docker ps -aq)" ]; then sudo docker rm -f $$(sudo docker ps -a -q); fi
	@if [ -n "$$(sudo docker images -q)" ]; then sudo docker rmi -f $$(sudo docker images -q); fi
	@if [ -n "$$(sudo docker volume ls -q)" ]; then sudo docker volume rm -f $$(sudo docker volume ls -q) && sudo docker volume prune -f; fi
# sudo rm -rf /home/pmagnero/data/mariadb /home/pmagnero/data/wordpress

re: fclean all

## Connect to ftp container
# ftp -p localhost 21
## Upload file to ftp server
# ftp -n <<EOF
# open localhost
# user pmagnero kek
# put style.css
# EOF

.PHONY: all build run stop clean fclean re