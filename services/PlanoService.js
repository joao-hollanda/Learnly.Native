import { HTTPClient } from "./client";

const PlanoAPI = {
  async Criar(dados) {
    const resposta = await HTTPClient.post("Plano", {
      titulo: dados.titulo,
      objetivo: dados.objetivo,
      dataInicio: _parseData(dados.dataInicio),
      dataFim: _parseData(dados.dataFim),
      horasPorSemana: dados.horasPorSemana ?? 0,
      planoIa: false,
    });
    return resposta.data;
  },

  async CriarComIA(dados) {
    const resposta = await HTTPClient.post("Plano", {
      titulo: `Plano IA — ${dados.objetivo?.slice(0, 40)}`,
      objetivo: dados.objetivo,
      dataInicio: new Date().toISOString(),
      dataFim: _parseData(dados.dataFim),
      horasPorSemana: dados.horasPorSemana ?? 10,
      planoIa: true,
    });
    return resposta.data;
  },

  async Obter(planoId) {
    const resposta = await HTTPClient.get(`Plano/${planoId}`);
    return resposta.data;
  },

  async Listar5() {
    const resposta = await HTTPClient.get(`Plano`);
    return resposta.data;
  },

  async Atualizar(planoId, dados) {
    const plano = await this.Obter(planoId);
    const resposta = await HTTPClient.put("Plano", {
      ...plano,
      titulo: dados.titulo ?? plano.titulo,
      objetivo: dados.objetivo ?? plano.objetivo,
      dataFim: dados.dataFim ? _parseData(dados.dataFim) : plano.dataFim,
      horasPorSemana: dados.horasPorSemana ?? plano.horasPorSemana,
    });
    return resposta.data;
  },

  async AtivarPlano(planoId) {
    const resposta = await HTTPClient.put(`Plano/${planoId}/ativar`);
    return resposta.data;
  },

  async ListarMaterias() {
    const resposta = await HTTPClient.get("Materia");
    return resposta.data;
  },

  async AdicionarMateria(planoId, dados) {
    const resposta = await HTTPClient.post(`Plano/${planoId}/materia`, dados);
    return resposta.data;
  },

  async LancarHoras(planoMateriaId, horas) {
    const resposta = await HTTPClient.put(
      `Plano/lancar-horas?planoMateriaId=${planoMateriaId}&horas=${horas}`
    );
    return resposta.data;
  },

  async ObterResumo() {
    const resposta = await HTTPClient.get(`Plano/gerar-resumo`);
    return resposta.data;
  },

  async CompararHoras() {
    const resposta = await HTTPClient.get(`Plano/horas/comparacao`);
    return resposta.data;
  },

  async Excluir(planoId) {
    const resposta = await HTTPClient.delete(`Plano/${planoId}`);
    return resposta.data;
  },

  async ObterPlanoAtivo() {
    const resposta = await HTTPClient.get(`Plano/plano-ativo`);
    return resposta.data;
  },
};

function _parseData(valor) {
  if (!valor) return new Date().toISOString();
  if (valor.includes("-")) return new Date(valor).toISOString();
  const [dia, mes, ano] = valor.split("/");
  return new Date(`${ano}-${mes}-${dia}T00:00:00.000Z`).toISOString();
}

export default PlanoAPI;