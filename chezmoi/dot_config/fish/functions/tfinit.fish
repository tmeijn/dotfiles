set -g tfinit_optspec 'b/backend=' no-plan

function tfinit --description 'Initialize Terraform with an optional partial backend file.'
    argparse $tfinit_optspec -- $argv
    or return

    set -l init_args

    if test -f "backends/local.tfbackend"
        echo "Local backend file detected, setting in command"
        set -gx TF_CLI_ARGS_init "-backend-config=backends/local.tfbackend"
    end

    if set -q _flag_backend
        if not test -f "backends/$_flag_backend.tfbackend"
            echo "Backend file 'backends/$_flag_backend.tfbackend' does not exist!"
            return 1
        end
        set init_args $init_args "-backend-config=backends/$_flag_backend.tfbackend"
        set -gx TF_VAR_env "$_flag_backend"
    end

    set init_args $init_args -reconfigure $argv

    terraform init $init_args

    if not set -q _flag_no_plan
        echo "==== Executing Terraform plan command... ===="
        terraform plan -out=plan.tfplan
    end
end

complete -f --command tfinit --arguments='(optspec2comp $tfinit_optspec)'
