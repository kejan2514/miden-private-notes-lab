use std::{error::Error, path::PathBuf, sync::Arc};

use miden_client::{
    builder::ClientBuilder,
    keystore::FilesystemKeyStore,
    rpc::{Endpoint, GrpcClient},
};
use miden_client_sqlite_store::ClientBuilderSqliteExt;

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    let fixture_root = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    let target_dir = fixture_root.join("target");

    std::fs::create_dir_all(&target_dir)?;

    let endpoint = Endpoint::testnet();
    let rpc_client = Arc::new(GrpcClient::new(&endpoint, 10_000));
    let keystore = Arc::new(FilesystemKeyStore::new(target_dir.join("keystore"))?);

    let client = ClientBuilder::new()
        .rpc(rpc_client)
        .sqlite_store(target_dir.join("fixture-store.sqlite3"))
        .authenticator(keystore)
        .in_debug_mode(true.into())
        .build()
        .await?;

    let scripts = [
        ("issuer-created", fixture_root.join("../policy-gated-note.masm")),
        (
            "detached-attestation",
            fixture_root.join("../detached-attestation-payment.masm"),
        ),
    ];

    for (name, path) in scripts {
        let source = std::fs::read_to_string(&path)?;
        client
            .code_builder()
            .compile_note_script(&source)
            .map_err(|err| format!("{name} note script failed to compile: {err}"))?;
        println!("{name}: COMPILE PASS");
    }

    Ok(())
}
