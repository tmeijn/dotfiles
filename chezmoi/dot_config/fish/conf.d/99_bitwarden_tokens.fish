##############################################
# BITWARDEN: auto load tokens if DB unlocked #
##############################################

function __load_tokens_if_rbw_unlocks --on-event rbw-unlocked
  if command -v rbw >/dev/null 2>&1
    if rbw unlocked >/dev/null 2>&1
        echo "🔓🗝️ Session unlocked, loading tokens from Bitwarden... 🔓🗝️"

        load_token OPENAI_API_KEY
        load_token GITLAB_TOKEN TF_HTTP_PASSWORD TF_VAR_gitlab_token GL_TOKEN LAB_CORE_TOKEN
        load_token GITHUB_TOKEN
    else
        echo "🔒 Bitwarden vault locked, not loading tokens. 🔒"
        echo "💡 To load tokens run the `reco` alias. 💡"
    end
  end
end

function load_token
  set -l token_name $argv[1]
  set -l token_value (rbw get $token_name)
  set -gx $token_name $token_value
  echo "🔓 $token_name"
  for alias in $argv[2..-1]
      set -gx $alias $token_value
      echo "🔓 $alias (alias of $token_name)"
  end
end

function reco
  rbw unlock
  emit rbw-unlocked
end

# Call one time to see if already unlocked.
__load_tokens_if_rbw_unlocks
