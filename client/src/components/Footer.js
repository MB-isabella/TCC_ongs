import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';

export default function Footer({ email }) {
	return (
		<footer className="footer">
			<div className="footer-conteudo">
				<div className="footer-contatos">
					<p>@ CONTATO: {email === undefined ? 'sisongstorres2026@gmail.com' : email}</p>
					{email === undefined && (
						<>
							<p>Sistema criado por estudantes do IFC Campus Sombrio</p>
							<p>Local de divulgação para as ONGs dos municípios na região de Torres RS</p>
						</>
					)}
				</div>
				<img className="footer-logo" src="/images/logobranca.PNG" alt="Logo do sistema" />
			</div>
		</footer>
	);
}
