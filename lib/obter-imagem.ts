import { getDownloadURL, ref } from "firebase/storage";
import { storage } from "./firebase";

export async function obterUrlImagem(path: string) {
    const storageRef = ref(storage, path);
    const url = await getDownloadURL(storageRef)
    return url
}
