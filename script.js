function buscarTemperaturaConformeLatitudeELongitudeDosInputs() {
  var valorDoElementoInputDaLatitude =
    document.querySelector("#latitude").value;
  var valorDoElementoInputDaLongitude =
    document.querySelector("#longitude").value;

  (async () => {
    const Latitude = parseFloat(valorDoElementoInputDaLatitude);
    const Longitude = parseFloat(valorDoElementoInputDaLongitude);

    if (
      isNaN(Latitude) ||
      isNaN(Longitude) ||
      Latitude < -90 ||
      Latitude > 90 ||
      Longitude < -180 ||
      Longitude > 180
    ) {
      document.getElementById("output").textContent =
        "Por favor, insira valores válidos para latitude (-90 a 90) e longitude (-180 a 180).";
      return;
    }

    const params = new URLSearchParams({
      latitude: Latitude,
      longitude: Longitude,
      hourly: "temperature_2m,precipitation_probability",
      timezone: "America/Sao_Paulo",
    });

    const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;

    try {
      const res = await fetch(url);
      const data = await res.json();

      const times = data.hourly.time;
      const temps = data.hourly.temperature_2m;
      const precipitation = data.hourly.precipitation_probability;

      // Encontra o índice da hora atual ou mais próxima
      const now = new Date();
      let startIndex = times.findIndex((t) => new Date(t) >= now);
      if (startIndex === -1) startIndex = 0;

      // Função para montar os cards dinamicamente
      function montarCards(inicio, fim, mostrarBotaoMais = true) {
        let output = `<div class="previsao-lista">`;
        for (let i = inicio; i < fim; i++) {
          output += `
            <div class="previsao-card${i === startIndex ? " destaque" : ""}">
              <div class="previsao-temp">
                ${
                  temps[i]
                }° <span class="previsao-icone"><img src="img/sol.gif"></span>
              </div>
               <div class="previsao-info chuva-inline">
                <img src="img/chuva.gif" class="icone-chuva">
                <span class="porcentagem-chuva">${precipitation[i]}%</span>
              </div>
              <div class="previsao-extra">
                <img src="img/tempo.gif" alt="Relógio">
                <span>${new Date(times[i]).toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}</span>
              </div>
            </div>
          `;
        }
        output += `</div>`;

        // Botão "Ver mais" ou "Ver menos"
        if (mostrarBotaoMais && fim < times.length) {
          output += `<div style="text-align:center; margin:24px 0 32px 0;">
            <button id="ver-mais" style="padding:8px 18px; border-radius:6px; background:#1976d2; color:#fff; border:none; cursor:pointer;">Ver mais</button>
          </div>`;
        } else if (!mostrarBotaoMais) {
          output += `<div style="text-align:center; margin:24px 0 32px 0;">
            <button id="ver-menos" style="padding:8px 18px; border-radius:6px; background:#1976d2; color:#fff; border:none; cursor:pointer;">Ver menos</button>
          </div>`;
        }
        return output;
      }

      // Mostra só 5 blocos inicialmente
      const endIndex = Math.min(startIndex + 5, times.length);
      document.getElementById("output").innerHTML = montarCards(
        startIndex,
        endIndex,
        true
      );

      // Evento do botão "Ver mais"
      document.getElementById("ver-mais")?.addEventListener("click", () => {
        document.getElementById("output").innerHTML = montarCards(
          startIndex,
          times.length,
          false
        );

        // Evento do botão "Ver menos"
        document.getElementById("ver-menos")?.addEventListener("click", () => {
          document.getElementById("output").innerHTML = montarCards(
            startIndex,
            endIndex,
            true
          );
          document.getElementById("ver-mais")?.addEventListener("click", () => {
            document.getElementById("output").innerHTML = montarCards(
              startIndex,
              times.length,
              false
            );
            document
              .getElementById("ver-menos")
              ?.addEventListener("click", () => {
                document.getElementById("output").innerHTML = montarCards(
                  startIndex,
                  endIndex,
                  true
                );
              });
          });
        });
      });
    } catch (error) {
      document.getElementById("output").textContent =
        "Erro ao obter dados do tempo.";
      console.error("Erro:", error);
    }
  })();
}

var elementoBotaoDeBuscar = document.querySelector("#botaoBuscar");
