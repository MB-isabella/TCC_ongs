import { useEffect, useState } from 'react';

const IMAGENS_CARROSSEL_PADRAO = [
	'/images/images-carrossel/voluntario.png',
	'/images/images-carrossel/meio-ambiente.png',
	'/images/images-carrossel/donation.png',
	'/images/images-carrossel/animais.png',
];

export default function CarrosselOngs({ rotulo = 'Carrossel de imagens', mostrarControles = false, imagens }) {
	const [slideAtual, setSlideAtual] = useState(0);
	const slides = imagens === undefined
		? IMAGENS_CARROSSEL_PADRAO
		: Array.isArray(imagens)
			? imagens.filter((imagem) => typeof imagem === 'string' && imagem.trim())
			: [];

	useEffect(() => {
		setSlideAtual(0);
	}, [slides.length]);

	useEffect(() => {
		if (slides.length < 2) return undefined;

		const intervalo = setInterval(() => {
			setSlideAtual((slide) => (slide + 1) % slides.length);
		}, 4500);

		return () => clearInterval(intervalo);
	}, [slides.length]);

	return (
		<div className="carrossel-ongs" aria-label={rotulo}>
			{slides.length > 0 ? slides.map((slide, indice) => (
				<div
					key={typeof slide === 'string' ? `${slide}-${indice}` : slide}
					className={`placeholder-foto${typeof slide === 'number' ? ` foto-${slide}` : ' foto-carrossel-real'}${indice === slideAtual ? ' placeholder-foto-ativa' : ''}`}
					aria-hidden={indice !== slideAtual}
				>
					{typeof slide === 'string'
						? <img className="imagem-carrossel-ong" src={slide} alt={`Imagem ${indice + 1} do carrossel`} />
						: <span className="sr-only">Imagem ilustrativa {slide}</span>}
				</div>
			)) : <p className="carrossel-sem-imagens">Esta ONG ainda não adicionou imagens.</p>}
			{mostrarControles && slides.length > 1 && (
				<>
					<button
						type="button"
						className="seta seta-esquerda"
						onClick={() => setSlideAtual((slide) => (slide - 1 + slides.length) % slides.length)}
						aria-label="Foto anterior"
					>‹</button>
					<button
						type="button"
						className="seta seta-direita"
						onClick={() => setSlideAtual((slide) => (slide + 1) % slides.length)}
						aria-label="Próxima foto"
					>›</button>
					<div className="indicadores">
						{slides.map((slide, indice) => (
							<button
								type="button"
								key={slide}
								className={indice === slideAtual ? 'indicador ativo' : 'indicador'}
								onClick={() => setSlideAtual(indice)}
								aria-label={`Selecionar foto ${indice + 1}`}
								aria-current={indice === slideAtual ? 'true' : undefined}
							/>
						))}
					</div>
				</>
			)}
		</div>
	);
}
