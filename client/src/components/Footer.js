import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import './Footer.css';

export default function Footer({ email }) {
	return (
		<footer className="footer">
			<div className="footer-conteudo">
				<div className="footer-contatos">
					<p>E-mail para contato: {email === undefined ? 'sisongstorres2026@gmail.com' : email}</p>
					{email === undefined && (
						<>
							<p>Telefone para contato: 67676767</p>
							<p>oi algo? hihi</p>
						</>
					)}
				</div>
				<img className="footer-logo" src="/images/logobranca.PNG" alt="Logo do sistema" />
			</div>
		</footer>
	);
}
