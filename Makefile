# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Makefile                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: pmagnero <pmagnero@student.42.fr>          +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2024/11/27 09:57:34 by pmagnero          #+#    #+#              #
#    Updated: 2025/04/11 12:02:15 by pmagnero         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

COMPOSE_FILE = ./docker-compose.yml
ENV = ./.env

all: elk monitoring avax webapp

setup:
	./setup.sh

elk:
	@echo "Cooking ELK STACK...";
	make -C ./elk

monitoring:
	@echo "Cooking MONITORING STACK...";
	make -C ./monitoring

avax:
	@echo "Cooking AVAX STACK...";
	make -C ./avax

webapp: build run

logs:
	@echo "#####LOGS#####"
	docker --log-level ERROR compose logs -f

build:
	@echo "Building webapp stack..."
	@mkdir -p ../data/logs
# mkdir -p /home/kek/data/front_data
# mkdir -p /home/kek/data/wordpress
	docker compose -f $(COMPOSE_FILE) build --no-cache

run:
	make -C ./elk run
	make -C ./monitoring run
	make -C ./avax run
	@echo "Running webapp stack..."
# docker network inspect elk_elk || docker network create elk_elk
	# docker --log-level ERROR compose -f $(COMPOSE_FILE) up -d front
	docker --log-level ERROR compose -f $(COMPOSE_FILE) up -d

stop:
	@echo "Stopping webapp stack..."
	docker compose -f $(COMPOSE_FILE) stop
	make -C ./elk stop
	make -C ./monitoring stop
	make -C ./avax stop


clean: stop
	@echo "Cleaning webapp stack..."
	docker compose -f $(COMPOSE_FILE) down -v
	make -C ./elk clean
	make -C ./monitoring clean
	make -C ./avax clean

fclean: clean
	@echo "Resetting everyting, ALL containers/images/volumes will be deleted..."
	@if [ -n "$$(docker ps -aq)" ]; then docker rm -f $$(docker ps -a -q); fi
	@if [ -n "$$(docker network ls)" ]; then docker network rm -f elk_elk monitoring_default netwurk; fi
	@if [ -n "$$(docker images -q)" ]; then docker rmi -f $$(docker images -q); fi
	@if [ -n "$$(docker volume ls -q)" ]; then docker volume rm -f $$(docker volume ls -q) && docker volume prune -f; fi
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

.PHONY: all build run stop clean fclean re elk monitoring avax logs webapp