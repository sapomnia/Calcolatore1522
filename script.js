// script.js

const DATA_URL = "centri_antiviolenza_con_regione.json";

document.addEventListener("DOMContentLoaded", () => {
  const regionSelect = document.getElementById("region-select");
  const provinceSelect = document.getElementById("province-select");
  const comuneSelect = document.getElementById("comune-select");
  const centersListEl = document.getElementById("centers-list");
  const centerDetailsEl = document.getElementById("center-details");

  let allCenters = [];
  let centersForSelection = [];

  // Utilità per opzioni dei <select>
  function setSelectOptions(selectEl, values, placeholder) {
    selectEl.innerHTML = "";
    const placeholderOption = document.createElement("option");
    placeholderOption.value = "";
    placeholderOption.textContent = placeholder;
    placeholderOption.disabled = false;
    placeholderOption.selected = true;
    selectEl.appendChild(placeholderOption);

    values.forEach((value) => {
      const opt = document.createElement("option");
      opt.value = value;
      opt.textContent = value;
      selectEl.appendChild(opt);
    });
  }

  function resetBelowRegion() {
    setSelectOptions(provinceSelect, [], "Seleziona una provincia");
    setSelectOptions(comuneSelect, [], "Seleziona un comune");
    provinceSelect.disabled = true;
    comuneSelect.disabled = true;
    centersListEl.innerHTML =
      '<li class="placeholder">Seleziona Regione, Provincia e Comune.</li>';
    centerDetailsEl.innerHTML =
      '<p class="placeholder">Clicca sul nome di un centro per vedere i dettagli.</p>';
  }

  function resetBelowProvince() {
    setSelectOptions(comuneSelect, [], "Seleziona un comune");
    comuneSelect.disabled = true;
    centersListEl.innerHTML =
      '<li class="placeholder">Seleziona un comune.</li>';
    centerDetailsEl.innerHTML =
      '<p class="placeholder">Clicca sul nome di un centro per vedere i dettagli.</p>';
  }

  function resetBelowComune() {
    centersListEl.innerHTML =
      '<li class="placeholder">Nessun centro trovato.</li>';
    centerDetailsEl.innerHTML =
      '<p class="placeholder">Clicca sul nome di un centro per vedere i dettagli.</p>';
  }

  // Carica dati
  fetch(DATA_URL)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Errore nel caricamento del JSON");
      }
      return response.json();
    })
    .then((data) => {
      allCenters = data;
      initRegions();
    })
    .catch((error) => {
      console.error(error);
      centersListEl.innerHTML =
        '<li class="placeholder">Errore nel caricamento dei dati.</li>';
    });

  function initRegions() {
    const regions = Array.from(
      new Set(allCenters.map((c) => c.regione))
    ).sort();

    setSelectOptions(regionSelect, regions, "Seleziona una regione");
    provinceSelect.disabled = true;
    comuneSelect.disabled = true;
  }

  regionSelect.addEventListener("change", () => {
    const selectedRegion = regionSelect.value;
    if (!selectedRegion) {
      resetBelowRegion();
      return;
    }

    const provinces = Array.from(
      new Set(
        allCenters
          .filter((c) => c.regione === selectedRegion)
          .map((c) => c.provincia)
      )
    ).sort();

    setSelectOptions(provinceSelect, provinces, "Seleziona una provincia");
    provinceSelect.disabled = false;
    resetBelowProvince();
  });

  provinceSelect.addEventListener("change", () => {
    const selectedRegion = regionSelect.value;
    const selectedProvince = provinceSelect.value;

    if (!selectedProvince) {
      resetBelowProvince();
      return;
    }

    const comuni = Array.from(
      new Set(
        allCenters
          .filter(
            (c) =>
              c.regione === selectedRegion &&
              c.provincia === selectedProvince
          )
          .map((c) => c.comune)
      )
    ).sort();

    setSelectOptions(comuneSelect, comuni, "Seleziona un comune");
    comuneSelect.disabled = false;
    resetBelowComune();
  });

  comuneSelect.addEventListener("change", () => {
    const selectedRegion = regionSelect.value;
    const selectedProvince = provinceSelect.value;
    const selectedComune = comuneSelect.value;

    if (!selectedComune) {
      resetBelowComune();
      return;
    }

    centersForSelection = allCenters.filter(
      (c) =>
        c.regione === selectedRegion &&
        c.provincia === selectedProvince &&
        c.comune === selectedComune
    );

    renderCentersList();
  });

  function renderCentersList() {
    centersListEl.innerHTML = "";

    if (!centersForSelection.length) {
      centersListEl.innerHTML =
        '<li class="placeholder">Nessun centro trovato.</li>';
      centerDetailsEl.innerHTML =
        '<p class="placeholder">Nessun centro da mostrare.</p>';
      return;
    }

    centersForSelection.forEach((center, index) => {
      const li = document.createElement("li");
      li.textContent = center.centro;
      li.dataset.index = String(index);

      li.addEventListener("click", () => {
        document
          .querySelectorAll(".centers-list li")
          .forEach((el) => el.classList.remove("active"));
        li.classList.add("active");
        showCenterDetails(center);
      });

      centersListEl.appendChild(li);
    });

    // reset dettagli
    centerDetailsEl.innerHTML =
      '<p class="placeholder">Clicca sul nome di un centro per vedere i dettagli.</p>';
  }

  function showCenterDetails(center) {
    const indirizzi = (center.indirizzo || []).join("<br>");
    const contatti = (center.contatti || []).join("<br>");
    const orari = (center.orari || []).join("<br>");

    centerDetailsEl.innerHTML = `
      <h3>${center.centro}</h3>
      <p><strong>Regione:</strong> ${center.regione}</p>
      <p><strong>Provincia:</strong> ${center.provincia}</p>
      <p><strong>Comune:</strong> ${center.comune}</p>
      <p><strong>Indirizzo:</strong><br>${indirizzi || "—"}</p>
      <p><strong>Contatti:</strong><br>${contatti || "—"}</p>
      <p><strong>Orari:</strong><br>${orari || "—"}</p>
    `;
  }
});