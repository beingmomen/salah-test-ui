export const useErrorHandler = () => {
  const toast = useToast();
  // const { signOut } = useAuth();
  const handleError = async (error) => {
    console.error("Request error:", error?.response?._data);

    if (error?.response?._data) {
      const { _data: errorData } = error.response;

      if (errorData.statusCode === 400 || errorData.statusCode === 500) {
        if (errorData.errors) {
          Object.values(errorData.errors)
            .flat()
            .forEach((err) => {
              toast.add({ title: err, timeout: 4000, color: "red" });
            });
        } else {
          toast.add({
            title: errorData.message || "An error occurred",
            timeout: 4000,
            color: "error",
          });
        }
      } else {
        const errors = errorData.data || [errorData.message || ""];
        errors.forEach((err) => {
          toast.add({ title: err, timeout: 4000, color: "error" });
        });
      }

      if (errorData.statusCode === 401) {
        // await signOut({ callbackUrl: "/login", redirect: true });
      }
    }
  };

  return { handleError };
};
