FROM ruby:3.4-slim

RUN apt-get update -qq && apt-get install -y \
  build-essential \
  libpq-dev \
  libyaml-dev \
  nodejs \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY Gemfile Gemfile.lock* ./
RUN bundle install

COPY entrypoint.sh /usr/bin/
RUN chmod +x /usr/bin/entrypoint.sh

COPY . .

EXPOSE 3000

ENTRYPOINT ["entrypoint.sh"]
CMD ["bundle", "exec", "rails", "server", "-b", "0.0.0.0", "-p", "3000"]
