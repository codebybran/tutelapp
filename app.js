/* Tutelapp — todo ocurre en el navegador. No se guarda ni se envía nada. */
(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const form = $("form");

  const ORDINALES = [
    "PRIMERA", "SEGUNDA", "TERCERA", "CUARTA", "QUINTA", "SEXTA", "SÉPTIMA",
    "OCTAVA", "NOVENA", "DÉCIMA", "UNDÉCIMA", "DUODÉCIMA",
  ];

  const REPARTO = {
    eps: "municipales",
    territorial: "municipales",
    particular: "municipales",
    nacional: "circuito",
  };

  const TEXTO_REPARTO = {
    municipales:
      "Según el Decreto 333 de 2021, esta tutela se reparte a los <strong>jueces municipales</strong> (EPS, entidades municipales o departamentales y particulares).",
    circuito:
      "Según el Decreto 333 de 2021, esta tutela se reparte a los <strong>jueces del circuito</strong> (entidades públicas del orden nacional).",
  };

  /* ---------- Interacciones del formulario ---------- */

  function alternar(el, mostrar) {
    el.classList.toggle("oculto", !mostrar);
  }

  document.querySelectorAll('input[name="calidad"]').forEach((r) =>
    r.addEventListener("change", () =>
      alternar($("bloqueRepresentado"), calidad() === "representacion")
    )
  );

  $("tipoAccionado").addEventListener("change", (e) => {
    const nivel = REPARTO[e.target.value];
    const p = $("reparto");
    if (nivel) {
      p.innerHTML = TEXTO_REPARTO[nivel];
      alternar(p, true);
    } else {
      alternar(p, false);
    }
  });

  $("chkOtro").addEventListener("change", (e) => alternar($("bloqueOtro"), e.target.checked));
  $("medida").addEventListener("change", (e) => alternar($("bloqueMedida"), e.target.checked));

  // Quita la marca de error al corregir un campo.
  form.addEventListener("input", (e) => e.target.classList.remove("invalido"));
  form.addEventListener("change", (e) => e.target.classList.remove("invalido"));

  /* ---------- Utilidades ---------- */

  function calidad() {
    return document.querySelector('input[name="calidad"]:checked').value;
  }

  function val(id) {
    return $(id).value.trim();
  }

  function lineas(id) {
    return $(id)
      .value.split(/\r?\n/)
      .map((l) => l.trim().replace(/^(\d+[.)-]|[-•*])\s*/, ""))
      .filter(Boolean);
  }

  function derechosMarcados() {
    return Array.from(document.querySelectorAll("#derechos input:checked")).map((c) => c.value);
  }

  function listaDerechos() {
    return derechosMarcados()
      .map((d) => (d === "otro" ? val("otroDerecho").toLowerCase() : d))
      .filter(Boolean);
  }

  function unirConY(arr) {
    if (arr.length <= 1) return arr.join("");
    return arr.slice(0, -1).join(", ") + " y " + arr[arr.length - 1];
  }

  function terminarEnPunto(t) {
    return /[.!?:;]$/.test(t) ? t : t + ".";
  }

  function ordinal(i) {
    return ORDINALES[i] || i + 1 + ".ª";
  }

  /* ---------- Validación ---------- */

  function validar() {
    const errores = [];
    const marcar = (id, msg) => {
      $(id).classList.add("invalido");
      errores.push({ id, msg });
    };

    if (!val("nombre")) marcar("nombre", "Escribe tus nombres y apellidos.");
    if (!val("tipoDoc")) marcar("tipoDoc", "Selecciona el tipo de documento.");
    if (!val("numDoc")) marcar("numDoc", "Escribe el número de documento.");
    if (!val("ciudad")) marcar("ciudad", "Escribe tu ciudad de residencia.");
    if (!val("direccion")) marcar("direccion", "Escribe tu dirección.");
    if (!val("correo")) marcar("correo", "Escribe tu correo electrónico.");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val("correo")))
      marcar("correo", "El correo electrónico no parece válido.");
    if (!val("telefono")) marcar("telefono", "Escribe tu teléfono.");
    if (calidad() === "representacion" && !val("representado"))
      marcar("representado", "Escribe el nombre de la persona que representas.");

    if (!val("accionado")) marcar("accionado", "Escribe contra quién presentas la tutela.");
    if (!val("tipoAccionado")) marcar("tipoAccionado", "Selecciona el tipo de entidad o persona.");

    if (derechosMarcados().length === 0)
      errores.push({ id: "chkOtro", msg: "Marca al menos un derecho vulnerado." });
    if ($("chkOtro").checked && !val("otroDerecho"))
      marcar("otroDerecho", "Escribe cuál es el otro derecho vulnerado.");

    if (lineas("hechos").length === 0) marcar("hechos", "Escribe al menos un hecho.");
    if (lineas("pretensiones").length === 0) marcar("pretensiones", "Escribe al menos una petición al juez.");
    if ($("medida").checked && !val("urgencia"))
      marcar("urgencia", "Explica por qué es urgente la medida provisional.");

    if (!$("juramento").checked)
      marcar("juramento", "Debes aceptar el juramento para generar la tutela.");

    return errores;
  }

  function mostrarErrores(errores) {
    const caja = $("errores");
    caja.innerHTML = "";
    if (errores.length === 0) {
      alternar(caja, false);
      return;
    }
    const titulo = document.createElement("strong");
    titulo.textContent = "Revisa lo siguiente antes de generar la tutela:";
    const ul = document.createElement("ul");
    errores.forEach((e) => {
      const li = document.createElement("li");
      li.textContent = e.msg;
      ul.appendChild(li);
    });
    caja.append(titulo, ul);
    alternar(caja, true);
    const primero = $(errores[0].id);
    primero.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => primero.focus({ preventScroll: true }), 350);
  }

  /* ---------- Redacción del documento ---------- */

  function generarTexto() {
    const nombre = val("nombre");
    const tipoDoc = val("tipoDoc");
    const numDoc = val("numDoc");
    const ciudad = val("ciudad");
    const direccion = val("direccion");
    const correo = val("correo");
    const telefono = val("telefono");
    const enRep = calidad() === "representacion";
    const representado = val("representado");
    const calidadRep = val("calidadRep");
    const accionado = val("accionado");
    const tipoAcc = val("tipoAccionado");
    const notifAcc = val("notifAccionado");
    const derechosSel = derechosMarcados();
    const derechos = listaDerechos();
    const hechos = lineas("hechos");
    const pretensiones = lineas("pretensiones");
    const medida = $("medida").checked;
    const urgencia = val("urgencia");
    const pruebas = lineas("pruebas");

    const fecha = new Date().toLocaleDateString("es-CO", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const nivel = REPARTO[tipoAcc];
    const juezTxt = nivel === "circuito" ? "JUEZ DEL CIRCUITO (REPARTO)" : "JUEZ MUNICIPAL (REPARTO)";
    const accionante = enRep ? representado : nombre;
    const identif = `${nombre}, identificado(a) con ${tipoDoc} número ${numDoc}, residente en ${ciudad}`;

    const partes = [];

    // Encabezado
    partes.push(`${ciudad}, ${fecha}`);
    partes.push(`Señor(a)\n${juezTxt}\n${ciudad}\nE. S. D.`);

    // Referencia
    partes.push(
      `REFERENCIA: ACCIÓN DE TUTELA\n` +
        `ACCIONANTE: ${accionante.toUpperCase()}` +
        (enRep ? `\nACTÚA EN SU NOMBRE: ${nombre.toUpperCase()}` : "") +
        `\nACCIONADO: ${accionado.toUpperCase()}\n` +
        `DERECHOS: ${unirConY(derechos).toUpperCase()}`
    );

    // Partes / presentación
    let presentacion;
    if (enRep) {
      presentacion =
        `${identif}, actuando ${calidadRep ? "en calidad de " + calidadRep + " y " : ""}en representación de ${representado}, ` +
        `respetuosamente acudo ante su Despacho para interponer ACCIÓN DE TUTELA, conforme al artículo 86 de la Constitución Política ` +
        `y al Decreto 2591 de 1991, en contra de ${accionado}, con el fin de que se protejan los derechos fundamentales ` +
        `de mi representado(a) (${unirConY(derechos)}), con fundamento en los siguientes:`;
    } else {
      presentacion =
        `${identif}, actuando en nombre propio, respetuosamente acudo ante su Despacho para interponer ACCIÓN DE TUTELA, ` +
        `conforme al artículo 86 de la Constitución Política y al Decreto 2591 de 1991, en contra de ${accionado}, ` +
        `con el fin de que se protejan mis derechos fundamentales (${unirConY(derechos)}), ` +
        `con fundamento en los siguientes:`;
    }
    partes.push(presentacion);

    // Hechos
    partes.push(
      "I. HECHOS\n\n" + hechos.map((h, i) => `${i + 1}. ${terminarEnPunto(h)}`).join("\n")
    );

    // Derechos vulnerados
    partes.push(
      "II. DERECHOS FUNDAMENTALES VULNERADOS\n\n" +
        `Considero vulnerados ${enRep ? "los derechos fundamentales de mi representado(a)" : "mis derechos fundamentales"} a:\n` +
        derechos.map((d) => `• ${d.charAt(0).toUpperCase() + d.slice(1)}.`).join("\n")
    );

    // Fundamentos de derecho
    const fundamentos = [
      "Artículo 86 de la Constitución Política de Colombia, que consagra la acción de tutela como mecanismo para la protección inmediata de los derechos constitucionales fundamentales cuando resulten vulnerados o amenazados por la acción o la omisión de cualquier autoridad pública o de los particulares en los casos que señala la ley.",
      "Artículo 1 del Decreto 2591 de 1991, sobre el objeto de la acción de tutela.",
      "Artículo 5 del Decreto 2591 de 1991, sobre la procedencia de la acción de tutela contra toda acción u omisión de las autoridades públicas y de los particulares que viole o amenace derechos fundamentales.",
      "Artículo 14 del Decreto 2591 de 1991, sobre el contenido de la solicitud, que puede presentarse sin formalidades.",
      "Artículo 37 del Decreto 2591 de 1991, sobre la competencia en primera instancia y el juramento de no haber presentado otra acción por los mismos hechos y derechos.",
    ];
    if (medida)
      fundamentos.push(
        "Artículo 7 del Decreto 2591 de 1991, que faculta al juez para adoptar medidas provisionales cuando lo considere necesario y urgente para proteger el derecho."
      );
    if (derechosSel.includes("salud"))
      fundamentos.push(
        "Ley Estatutaria 1751 de 2015, que reconoce la salud como derecho fundamental autónomo e irrenunciable y regula su garantía."
      );
    if (derechosSel.includes("petición"))
      fundamentos.push(
        "Artículo 23 de la Constitución Política, que consagra el derecho de toda persona a presentar peticiones respetuosas a las autoridades y a obtener pronta resolución.",
        "Ley 1755 de 2015, que regula el derecho fundamental de petición y fija los términos para responder."
      );
    fundamentos.push(
      `Decreto 333 de 2021, sobre las reglas de reparto de la acción de tutela, según el cual el presente asunto corresponde a los jueces ${nivel === "circuito" ? "del circuito" : "municipales"}.`
    );
    partes.push(
      "III. FUNDAMENTOS DE DERECHO\n\n" + fundamentos.map((f, i) => `${i + 1}. ${f}`).join("\n")
    );

    // Pretensiones
    partes.push(
      "IV. PRETENSIONES\n\nCon base en lo anterior, solicito respetuosamente al señor(a) Juez:\n\n" +
        pretensiones.map((p, i) => `${ordinal(i)}: ${terminarEnPunto(p)}`).join("\n")
    );

    let n = 5;
    const romano = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

    // Medida provisional
    if (medida) {
      partes.push(
        `${romano[n++]}. SOLICITUD DE MEDIDA PROVISIONAL\n\n` +
          "Con fundamento en el artículo 7 del Decreto 2591 de 1991, solicito al señor(a) Juez decretar como medida provisional, " +
          "mientras se profiere el fallo, que se ordene a la parte accionada adoptar de inmediato las acciones necesarias para " +
          "proteger los derechos invocados, por las siguientes razones de urgencia:\n\n" +
          terminarEnPunto(urgencia)
      );
    }

    // Pruebas
    partes.push(
      `${romano[n++]}. PRUEBAS Y ANEXOS\n\n` +
        (pruebas.length
          ? "Solicito tener como pruebas y anexos los siguientes documentos:\n\n" +
            pruebas.map((p, i) => `${i + 1}. ${terminarEnPunto(p)}`).join("\n")
          : "No se aportan documentos en este momento. Solicito al señor(a) Juez decretar las pruebas que estime necesarias.")
    );

    // Juramento
    partes.push(
      `${romano[n++]}. JURAMENTO\n\n` +
        "Manifiesto bajo la gravedad del juramento que no he presentado otra acción de tutela por los mismos hechos y derechos, " +
        "de conformidad con el artículo 37 del Decreto 2591 de 1991."
    );

    // Notificaciones
    partes.push(
      `${romano[n++]}. NOTIFICACIONES\n\n` +
        `Accionante: ${direccion}, ${ciudad}. Correo electrónico: ${correo}. Teléfono: ${telefono}.\n\n` +
        `Accionado: ${accionado}${notifAcc ? ", en " + notifAcc : ", en la dirección o el correo de notificaciones judiciales que tenga registrado"}.`
    );

    // Firma
    partes.push(
      "Atentamente,\n\n\n\n" +
        "______________________________\n" +
        `${nombre}\n` +
        `${tipoDoc.charAt(0).toUpperCase() + tipoDoc.slice(1)} n.º ${numDoc}` +
        (enRep ? `\nEn representación de ${representado}` : "")
    );

    return partes.join("\n\n");
  }

  /* ---------- Acciones ---------- */

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    form.querySelectorAll(".invalido").forEach((el) => el.classList.remove("invalido"));
    const errores = validar();
    mostrarErrores(errores);
    if (errores.length) return;

    $("documento").textContent = generarTexto();
    alternar($("resultado"), true);
    $("resultado").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  function toast(msg) {
    const t = $("toast");
    t.textContent = msg;
    t.classList.add("visible");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove("visible"), 2200);
  }

  $("btnCopiar").addEventListener("click", async () => {
    const texto = $("documento").textContent;
    try {
      await navigator.clipboard.writeText(texto);
      toast("Texto copiado ✓");
    } catch {
      // Respaldo para navegadores sin API de portapapeles (o sin HTTPS)
      const ta = document.createElement("textarea");
      ta.value = texto;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      toast(ok ? "Texto copiado ✓" : "No se pudo copiar. Selecciona el texto manualmente.");
    }
  });

  $("btnPdf").addEventListener("click", () => window.print());
})();
