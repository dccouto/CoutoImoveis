export function traduzirErro(erro: { code?: string, message?: string } | null | undefined): string {
  const codigo = erro?.code ?? ''
  const mensagem = (erro?.message ?? '').toLowerCase()

  if (
    codigo === 'PGRST205'
    || codigo === '42P01'
    || mensagem.includes('schema cache')
    || mensagem.includes('does not exist')
  ) {
    return 'Falta schema no Supabase. Em projeto novo, cole 0001_imoveis.sql e 0002_link_maps.sql. Se a tabela já existir, cole só 0002_link_maps.sql no SQL Editor.'
  }

  if (codigo === 'PGRST116') {
    return 'Registro não encontrado. Confira se o SQL inicial foi aplicado no Supabase.'
  }

  if (
    codigo === '42501'
    || mensagem.includes('row-level security')
    || mensagem.includes('permission denied')
    || mensagem.includes('jwt')
  ) {
    return 'Sem permissão. Entre com o usuário administrador e confira se as políticas foram criadas.'
  }

  if (mensagem.includes('invalid login') || mensagem.includes('invalid credentials')) {
    return 'E-mail ou senha incorretos.'
  }

  if (mensagem.includes('file size') || mensagem.includes('payload too large') || mensagem.includes('exceeded')) {
    return 'A foto passou do limite de 8 MB.'
  }

  if (mensagem.includes('mime') || mensagem.includes('invalid file type')) {
    return 'Envie apenas fotos JPEG, PNG ou WebP.'
  }

  return 'Não foi possível concluir agora. Tente de novo.'
}
