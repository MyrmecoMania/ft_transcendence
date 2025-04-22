# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Makefile                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: pmagnero <pmagnero@student.42.fr>          +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2024/11/27 09:57:34 by pmagnero          #+#    #+#              #
#    Updated: 2025/02/27 11:40:09 by pmagnero         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

COMPOSE_FILE = ./docker-compose.yml
ENV = ./.env

all: build run

logs:
	@echo "#####LOGS#####"
	docker --log-level ERROR compose logs

build:
	@echo "Building monitoring stack..."
	@mkdir -p ../data/monitoring/prometheus
	@mkdir -p ../data/monitoring/grafana
	@cp ./grafana/grafana.db ../data/monitoring/grafana/
	@sudo chmod -R 777 ../data/
# mkdir -p /home/kek/data/front_data
# mkdir -p /home/kek/data/wordpress
	docker compose -f $(COMPOSE_FILE) build --no-cache

run:
	@echo "Running monitoring stack..."
	docker --log-level ERROR compose -f $(COMPOSE_FILE) up --remove-orphans -d

stop:
	@echo "Stopping monitoring stack..."
	docker compose -f $(COMPOSE_FILE) stop

clean: stop
	@echo "Cleaning monitoring stack..."
	docker compose -f $(COMPOSE_FILE) down -v

fclean: clean
	@echo "Resetting everyting, ALL containers/images/volumes will be deleted..."
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