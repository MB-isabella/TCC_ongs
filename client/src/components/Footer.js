import './Footer.css';

export default function Footer({ email }) {
	return (
		<footer className="footer">
			<div className="footer-contatos">
				<p>E-mail para contato: {email === undefined ? 'blabla@email.com' : email}</p>
				{email === undefined && (
					<>
						<p>Telefone para contato: 67676767</p>
						<p>oi algo? hihi</p>
					</>
				)}
			</div>
		</footer>
	);
}
