#!/bin/bash

# Set up git secrets
git clone -q --no-tags --single-branch git@github.com:awslabs/git-secrets.git ~/.git-secrets
sudo make -C ~/.git-secrets install

# cpio is required for package/release builds (npm run package)
sudo apt -y update && sudo apt install -y cpio

# Some useful aliases
# Container image includes VIM aliased as vi
echo "alias ll='ls -alF'" >> ~/.bash_aliases
echo "alias vim='vi'" >> ~/.bash_aliases
echo "alias ls='ls -lah --color=auto'" >> ~/.bash_aliases
echo "alias ll='ls -lah --color=auto'" >> ~/.bash_aliases
echo "alias gl='git log --pretty=\"format:%C(yellow)%h %C(green)%G?%C(auto)%d %s\" -10'" >> ~/.bash_aliases
echo "alias gs='git status'" >> ~/.bash_aliases
echo "alias gc='git checkout'" >> ~/.bash_aliases
echo "alias dev='git checkout develop'" >> ~/.bash_aliases
echo "alias gcd='git checkout develop'" >> ~/.bash_aliases
echo "alias gcm='git checkout master'" >> ~/.bash_aliases
