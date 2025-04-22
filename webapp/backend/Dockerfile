# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/go/dockerfile-reference/

# Want to help us make this template better? Share your feedback here: https://forms.gle/ybq9Krt8jtBL3iCk7

ARG NODE_VERSION=22

FROM node:${NODE_VERSION}-alpine

LABEL maintainer="Pierre MAGNERON <pmagnero@student.42.fr>"
LABEL version="1.0"
LABEL description="Front JS of transcendence"

# Use production node environment by default.
ENV NODE_ENV=production

RUN mkdir -p /usr/src/app/node_modules && chown -R node:node /usr/src/app

WORKDIR /usr/src/app

# Download dependencies as a separate step to take advantage of Docker's caching.
# Leverage a cache mount to /root/.npm to speed up subsequent builds.
# Leverage a bind mounts to package.json and package-lock.json to avoid having to copy them into
# into this layer.

# RUN ls -la . && pwd

RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/node/.npm \
    npm ci --omit=dev

# Copy the rest of the source files into the image.
COPY --chown=node:node . .

RUN chown -R node:node node_modules

# RUN yarn && yarn add typescript tsc ts-node && yarn build

# RUN npm install

# RUN npm install typescript ts-node @types/node
# RUN npm run build

# RUN npx tsc --init

# RUN npx tsc src/public/staticJs.ts


# Run the application as a non-root user.
USER node

RUN npx @tailwindcss/cli -i ./css/stylesheet.css -o ./css/output.css

# RUN ls -la backend

# RUN ls -la node_modules

# RUN npm i

# RUN node -v
# # RUN nvm current
# RUN npm -v

# Expose the port that the application listens on.
EXPOSE 3200

# Run the application.
CMD ["node",  "src/server.js"]
