#!/usr/bin/env bash
set -euo pipefail

project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
input_file="${1:-}"

if [[ -z "${input_file}" || ! -f "${input_file}" ]]; then
  echo "Kullanım: npm run market:import -- /tam/yol/WhatsApp-sohbeti.zip" >&2
  exit 64
fi

temporary_dir="$(mktemp -d)"
cleanup() { rm -rf "${temporary_dir}"; }
trap cleanup EXIT

case "${input_file,,}" in
  *.zip)
    unzip -qq -j "${input_file}" '*.txt' -d "${temporary_dir}"
    mapfile -t text_files < <(find "${temporary_dir}" -maxdepth 1 -type f -name '*.txt')
    if [[ "${#text_files[@]}" -ne 1 ]]; then
      echo "ZIP içinde tam olarak bir WhatsApp .txt dışa aktarımı bulunmalı." >&2
      exit 65
    fi
    chat_file="${text_files[0]}"
    ;;
  *.txt)
    chat_file="${input_file}"
    ;;
  *)
    echo "Yalnız WhatsApp .zip veya .txt dışa aktarımı desteklenir." >&2
    exit 65
    ;;
esac

node "${project_root}/scripts/import-whatsapp-market.mjs" "${chat_file}" "${project_root}/data/market-whatsapp.json"
node "${project_root}/scripts/validate-data.mjs"
echo "Piyasa arşivi anonim olarak güncellendi; ham sohbet saklanmadı."
