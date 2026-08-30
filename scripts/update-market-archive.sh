#!/usr/bin/env bash
set -euo pipefail

project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
input_files=("$@")

if [[ "${#input_files[@]}" -eq 0 ]]; then
  echo "Kullanım: npm run market:import -- /tam/yol/yeni-sohbet.zip [/tam/yol/önceki-sohbet.zip ...]" >&2
  exit 64
fi

temporary_dir="$(mktemp -d)"
cleanup() { rm -rf "${temporary_dir}"; }
trap cleanup EXIT

chat_files=()
for index in "${!input_files[@]}"; do
  input_file="${input_files[$index]}"
  if [[ ! -f "${input_file}" ]]; then
    echo "Dosya bulunamadı: ${input_file}" >&2
    exit 64
  fi
  case "${input_file,,}" in
    *.zip)
      archive_dir="${temporary_dir}/archive-${index}"
      mkdir -p "${archive_dir}"
      unzip -qq -j "${input_file}" '*.txt' -d "${archive_dir}"
      mapfile -t text_files < <(find "${archive_dir}" -maxdepth 1 -type f -name '*.txt')
      if [[ "${#text_files[@]}" -ne 1 ]]; then
        echo "Her ZIP içinde tam olarak bir WhatsApp .txt dışa aktarımı bulunmalı." >&2
        exit 65
      fi
      chat_files+=("${text_files[0]}")
      ;;
    *.txt)
      chat_files+=("${input_file}")
      ;;
    *)
      echo "Yalnız WhatsApp .zip veya .txt dışa aktarımı desteklenir." >&2
      exit 65
      ;;
  esac
done

node "${project_root}/scripts/import-whatsapp-market.mjs" "${chat_files[@]}" "${project_root}/data/market-whatsapp.json"
node "${project_root}/scripts/validate-data.mjs"
echo "Piyasa arşivi çakışmalar tekilleştirilerek anonim güncellendi; ham sohbet saklanmadı."
