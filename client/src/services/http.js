const request = async (url, params) => {
  try {
    const response = await fetch(url, params);
    return await response.json();
  } catch (err) {
    console.error(err);
    return null;
  }
};

export class HttpService {
  baseURL;

  constructor(baseUrl) {
    this.baseURL = baseUrl;
  }

  get(path) {
    const url = new URL(this.baseURL + path);

    return request(url, {
      method: "GET",
    });
  }
}
