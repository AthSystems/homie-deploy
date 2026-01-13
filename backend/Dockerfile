FROM eclipse-temurin:21-jre-alpine

RUN addgroup -g 1000 -S homie && adduser -u 1000 -S homie -G homie

WORKDIR /app

RUN mkdir -p /app/data/files && chown -R homie:homie /app

# Copy pre-built JAR
COPY --chown=homie:homie app.jar app.jar

# Copy bundled data files
COPY --chown=homie:homie data/ /app/data/bundled/

USER homie

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
