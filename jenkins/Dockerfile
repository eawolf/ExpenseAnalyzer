FROM jenkins/jenkins:lts
USER root

# Install prerequisites
RUN apt-get update && apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Add Docker's official GPG key
RUN mkdir -m 0755 -p /etc/apt/keyrings
RUN curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up the Docker repository
RUN echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker CLI and Docker Compose Plugin
RUN apt-get update && apt-get install -y docker-ce-cli docker-compose-plugin

# Ensure Jenkins user can run docker (though compose file runs as root)
RUN groupadd -f docker && usermod -aG docker jenkins

USER root
