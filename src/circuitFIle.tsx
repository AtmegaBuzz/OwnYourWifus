export const circuitCode = `
import "hashes/sha256/512bitPacked" as sha256packed;


def main(field owner, field prompt, field uri, field aigc_data_hash0, field aigc_data_hash1, private field token_id, private field model_id, private field model_addr, private field model_data_hash0, private field model_data_hash1) -> field[2] {
     
    
    field[2] computed_hash1 = sha256packed([owner, prompt, uri, 0]);
    field[2] computed_hash2 = sha256packed([token_id, model_id, model_addr, 0]);

    
   
    assert(computed_hash1[0] == aigc_data_hash0);
    assert(computed_hash1[1] == aigc_data_hash1);


    assert(computed_hash2[0] == model_data_hash0);
    assert(computed_hash2[1] == model_data_hash1);

    
    field[2] nullifier = sha256packed([computed_hash1[0], computed_hash1[1], computed_hash2[0], computed_hash2[1]]);

    return nullifier;
}
`