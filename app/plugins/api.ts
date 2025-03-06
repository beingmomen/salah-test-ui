export default defineNuxtPlugin(() => {


  const config = useRuntimeConfig()


  const api = $fetch.create({
    baseURL: `${config.public.baseURL}`, // Replace with your API base URL
    headers: {
      "Content-Type": "application/json",
    },
    // async onRequest({ options }) {
    //   // const { token } = useAuth()
    //   // if (token.value) {
    //   //   options.headers = {
    //   //     ...options.headers,
    //   //     Authorization: `${token.value}`,
    //   //   }
    //   // }
    // },
  })




  return {
    provide: {
      api
    }
  }
})