import { HTTPClient } from "./client";

const LoginAPI = {
  async Login(email, senha) {
    const resposta = await HTTPClient.post(`Login/mobile`, {
      email,
      senha,
    });
    return resposta.data;
  },

  async Register(nome, email, senha) {
    const resposta = await HTTPClient.post(`Usuarios/Criar`, {
      nome,
      email,
      senha,
      cidade: "",
    });
    return resposta.data;
  },

  async GetUser() {
    const resposta = await HTTPClient.get(`Login/user`);
    return resposta.data;
  },

  async Awake() {
    const resposta = await HTTPClient.get(`Login/ping`);
    return resposta.data;
  },

  async Logout() {
    try {
      await HTTPClient.post(`Login/logout`);
    } catch {
    }
  },

  async RefreshTokenMobile(refreshToken) {
    const resposta = await HTTPClient.post(`Login/mobile/refresh`, {
      refreshToken,
    });
    return resposta.data;
  },
};

export default LoginAPI;