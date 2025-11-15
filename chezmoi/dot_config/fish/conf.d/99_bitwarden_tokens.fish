##############################################
# BITWARDEN: auto load tokens if DB unlocked #
##############################################

function __load_tokens_if_rbw_unlocks --on-event rbw-unlocked
  if type -q rbw
    if rbw unlocked >/dev/null 2>&1
      echo "🔓🗝️ Session unlocked, loading tokens from Bitwarden... 🔓🗝️"

      load_tokens_from_bw_api_folder
    else
      echo "🔒 Bitwarden vault locked, not loading tokens. 🔒"
      echo "💡 To load tokens run the `reco` alias. 💡"
    end
  end
end

function load_tokens_from_bw_api_folder --description "Dynamically loads all applicable tokens from the BitWarden API Tokens folder."
  set tokens_to_load (rbw list --raw | jq -r '.[] | select(.folder == "API Tokens") | .name' | sort)

  for token in $tokens_to_load
    # Store <key|name> <notes> [aliases] [skip_load]
    set token_info (rbw get $token --raw | jq -r '
      (
        (.fields[]? | select(.name == "key") | .value)
        // .name
      ) + "\n" + (.notes // "")
      + "\n" + ((.fields[]? | select(.name == "aliases") | .value) // "")
      + "\n" + ((.fields[]? | select(.name == "skip_load") | .value) // "false")
    ')

    set -l key $token_info[1]
    set -l value $token_info[2]
    set -l aliases (string trim $token_info[3])
    set -l skip_load $token_info[4]

    if test $skip_load = "true"
      # echo "ℹ️  INFO: Not loading $key due to skip_load being 'true'"
      continue
    end

    if not string match -qr '^[A-Za-z_]+$' $key
      echo "⛔ ERROR: $key does not have a valid key! Either match the 'name' or 'key' custom field to pass '^[A-Za-z_]+\$' regex"
      continue
    end


    set_token $key $value $aliases
  end
end

function set_token

  set -l token_name $argv[1]
  set -l token_value $argv[2]
  set -gx $token_name $token_value
  echo "🔓 $token_name"
  if test -z "$argv[3]"
    return
  end

  for alias in (string split ',' $argv[3])
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
