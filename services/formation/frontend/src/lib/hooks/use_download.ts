import { cobalt } from "@/configs/cobalt";
import { notifications } from "@mantine/notifications";
import { useState } from "react";

export const useDownload = (url: URL, fileName: string) => {
  const [loading, setLoading] = useState(false);

  const download = async () => {
    setLoading(true);

    try {
      const token = await cobalt.api.token();

      if (!token) {
        throw new Error("Failed to get token");
      }

      const res = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to download file");
      }

      const blob = await res.blob();

      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = fileName;
      a.click();
      a.remove();

      notifications.show({
        message: `File "${fileName}" has been downloaded`,
      });
    } catch (error) {
      if (error instanceof Error) {
        notifications.show({
          message: error.message,
        });
      } else {
        notifications.show({
          message: "Failed to download file",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return [loading, download] as const;
};
