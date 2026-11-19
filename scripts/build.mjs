/** Gera dist/ com apenas os arquivos públicos. Não requer dependências. */
import { cp, mkdir, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const output = join(root, "dist");
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const item of ["index.html", "css", "js", "assets"]) {
  await cp(join(root, item), join(output, item), {
    recursive: true,
    filter: (source) => !source.endsWith("-original.png"),
  });
}
console.log("Site preparado em dist/.");
