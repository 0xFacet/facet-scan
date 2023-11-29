export interface FacetCallPayload {
  op: "call";
  data: {
    to: string;
    function: string;
    args: any[] | { [key: string]: string };
  };
}

export interface FacetCreatePayload {
  op: "create";
  data: {
    source_code: string;
    init_code_hash: string;
    args: any[] | { [key: string]: string };
  };
}
