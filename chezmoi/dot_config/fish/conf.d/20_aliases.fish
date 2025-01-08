# Repeats the last command with `sudo` prefix
alias pls='sudo $history[1]'

# Needed for granted to work, see: https://docs.commonfate.io/granted/internals/shell-alias#grantedinternalsshell-alias
alias assume="source "$(dirname $(aqua which assume))"/assume.fish"

# Terraform aliases
alias tfapply='terraform apply plan.tfplan'
alias tfcopyplan='terraform show -no-color plan.tfplan | pbcopy'
alias tfplan='terraform plan -out=plan.tfplan'

# Helpers for working with Clipboard
alias pbcopy='xclip -selection clipboard'
alias pbpaste='xclip -selection clipboard -o'
alias cb='flatpak run app.getclipboard.Clipboard'
