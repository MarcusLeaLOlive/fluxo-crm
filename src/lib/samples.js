/* Negócios de exemplo com empresas fictícias, para conhecer o sistema. */
import { STAGE_BY_KEY } from "../config/crm.js";
import { addDaysISO, todayISO, createUuid } from "./format.js";

const HOUR = 36e5;

export function createSampleDeals() {
  const now = Date.now();
  const history = (...texts) => texts.map((txt, i) => ({ id: createUuid(), ts: now - (i + 1) * 26 * HOUR, txt }));

  const samples = [
    { titulo: "Sistema de gestão para 15 usuários", empresa: "Construtora Litoral Norte", cnpj: "11.222.333/0001-81", contato: "Rafael Moreira", cargo: "Diretor administrativo", email: "rafael@litoralnorte.com.br", tel: "(85) 99812-3344", cidade: "Fortaleza / CE", origem: "Site / formulário", etapa: "neg", valor: 18900, resp: "Marcus", fechamento: addDaysISO(10), atvTipo: "Reunião", atvData: todayISO(), atvDesc: "Alinhar condições de pagamento", log: history("Contraproposta recebida: pediu 10% de desconto", "Proposta enviada", "Demonstração realizada") },
    { titulo: "Implantação e treinamento", empresa: "Clínica Vida Plena", contato: "Dra. Juliana Prado", cargo: "Sócia", email: "juliana@vidaplena.med.br", tel: "(85) 98877-1020", cidade: "Fortaleza / CE", origem: "Indicação", etapa: "prop", valor: 7500, resp: "Larissa", fechamento: addDaysISO(18), atvTipo: "Ligação", atvData: addDaysISO(-2), atvDesc: "Confirmar recebimento da proposta", log: history("Proposta enviada por e-mail", "Reunião de diagnóstico") },
    { titulo: "Plano anual com 8 licenças", empresa: "Ótica Visão Clara", contato: "Pedro Henrique Lima", cargo: "Proprietário", email: "pedro@visaoclara.com.br", tel: "(88) 99654-2210", cidade: "Sobral / CE", origem: "Google Ads", etapa: "qual", valor: 4320, resp: "Marcus", fechamento: addDaysISO(30), atvTipo: "Reunião", atvData: addDaysISO(3), atvDesc: "Demonstração online", log: history("Lead preencheu o formulário do anúncio") },
    { titulo: "Integração com e-commerce", empresa: "Moda Sertaneja Ltda.", contato: "Camila Souza", cargo: "Gerente de e-commerce", email: "camila@modasertaneja.com.br", tel: "(83) 99123-4455", cidade: "Campina Grande / PB", origem: "LinkedIn", etapa: "prop", valor: 12400, resp: "Larissa", fechamento: addDaysISO(21), atvTipo: "E-mail", atvData: addDaysISO(1), atvDesc: "Enviar cases de clientes", log: history("Proposta enviada") },
    { titulo: "Plano mensal com 3 usuários", empresa: "Padaria Pão Dourado", contato: "Antônio Ferreira", cargo: "Proprietário", tel: "(85) 98765-0011", cidade: "Caucaia / CE", origem: "Instagram", etapa: "prosp", valor: 1188, resp: "Thiago", atvTipo: "WhatsApp", atvData: todayISO(), atvDesc: "Primeiro contato", log: history("Enviou mensagem pelo Instagram") },
    { titulo: "Licença corporativa para 40 usuários", empresa: "Transportes Rota Sul", contato: "Fernanda Albuquerque", cargo: "Head de operações", email: "fernanda@rotasul.com.br", tel: "(81) 99987-6543", cidade: "Recife / PE", origem: "Evento", etapa: "qual", valor: 46800, resp: "Marcus", fechamento: addDaysISO(45), atvTipo: "Tarefa", atvData: addDaysISO(-1), atvDesc: "Levantar requisitos de integração com o ERP", log: history("Conheceu a empresa no evento Nordeste Digital") },
    { titulo: "Plano anual com 5 licenças", empresa: "Escritório Contábil Mendes", contato: "Lucas Mendes", cargo: "Contador", email: "lucas@mendescontabil.com.br", tel: "(85) 99321-7788", cidade: "Maracanaú / CE", origem: "Prospecção ativa", etapa: "prosp", valor: 2700, resp: "Thiago", log: history("Ligação de prospecção: pediu retorno no mês que vem") },
    { titulo: "Upgrade para o plano Pro", empresa: "Academia Força Total", contato: "Bruno Castro", cargo: "Gerente", email: "bruno@forcatotal.fit", tel: "(85) 98800-1234", cidade: "Fortaleza / CE", origem: "Indicação", etapa: "ganho", valor: 5400, resp: "Larissa", fechamento: addDaysISO(-6), log: history("Contrato assinado", "Proposta aceita") },
    { titulo: "Sistema de gestão para 10 usuários", empresa: "Distribuidora Cariri", contato: "Marta Silveira", cargo: "Diretora financeira", email: "marta@distcariri.com.br", tel: "(88) 99777-3322", cidade: "Juazeiro do Norte / CE", origem: "Site / formulário", etapa: "ganho", valor: 14200, resp: "Marcus", fechamento: addDaysISO(-14), log: history("Contrato assinado", "Negociação concluída") },
    { titulo: "Plano anual com 12 licenças", empresa: "Imobiliária Casa Nova", contato: "Ricardo Teixeira", cargo: "Sócio", email: "ricardo@casanova.imb.br", tel: "(85) 99555-6677", cidade: "Eusébio / CE", origem: "Google Ads", etapa: "perdido", motivoPerda: "Escolheu um concorrente", valor: 6480, resp: "Thiago", fechamento: addDaysISO(-9), log: history("Perdido: escolheu um concorrente pelo preço") },
  ];

  return samples.map((deal, i) => ({
    id: `ex${i}${now.toString(36)}`,
    prob: STAGE_BY_KEY[deal.etapa].probability,
    updated: now - i * HOUR,
    ...deal,
  }));
}
