import { Flex, Box } from '@chakra-ui/react'
import RingCard from './RingCard'

const ringsRepository = [
    {
        name: 'Кольцо чёрно-красное',
        imageSrc: [
            'https://github.com/Au7umnDev/au7umndev.github.io/blob/main/src/img/Ring_black_and_red_1.jpg?raw=true',
            './src/img/Ring_black_and_red_2.jpg',
            './src/img/Ring_black_and_red_3.jpg'
        ],
        modelPath: './src/models/ring_black_and_red.glb',
        description: 'Металл: титан. Масса: 15 г',
        totalDescription: 'Привлекательное черное кольцо с тонкой красной линией, расположенной элегантно посередине, воплощает собой смелость и стиль. Его современный дизайн без излишеств создает впечатление тонкого вкуса и изысканности. Это утонченное украшение идеально подходит как для повседневного использования, так и для особых случаев, добавляя образу загадочности и утонченности. Глянцевое покрытие придает кольцу блеск и уникальность, привлекая внимание к его изысканной простоте. Создайте свой неповторимый стиль с этим изысканным аксессуаром, который подчеркнет вашу индивидуальность и выразит вашу уверенность в себе и свой вкус.'
    },
    {
        name: 'Кольцо золотое с гравировкой',
        imageSrc: [
            './src/img/ring_of_noobs_1.jpg',    
            './src/img/ring_of_noobs_2.jpg',
            './src/img/ring_of_noobs_3.jpg'
        ],
        modelPath: '',
        description: 'Металл: золото. Масса: 23 г',
        totalDescription: 'Погрузитесь в мир элегантности и утонченности с нашим золотым кольцом, украшенным изысканной гравировкой. Это изделие воплощает в себе чистоту и минимализм, создавая изящный акцент на вашей руке. Идеальное сочетание классического дизайна и современного стиля делает это кольцо универсальным аксессуаром, который подойдет как для повседневной носки, так и для особых случаев. Без камней, но с глубоким смыслом, запечатленным в каждом изгибе, оно станет символом вашей уникальности и вкуса. Подарите себе или близким роскошь, которая всегда будет актуальной.'
    },
    {
        name: 'Кольцо серебряное «Галадриэль»',
        imageSrc: [
            './src/img/nenia_ring_1.jpg',
            './src/img/nenia_ring_2.jpg',
            './src/img/nenia_ring_3.jpg'
        ],
        modelPath: '',
        description: 'Металл: серебро. Масса: 35 г',
        totalDescription: 'Окунитесь в магию древних легенд с нашим изящным серебряным эльфийским кольцом. Этот уникальный аксессуар, созданный в стиле эльфийского искусства, воплощает в себе легкость и изящество волшебного мира. Его тонкие линии и замысловатый узор, выполненные без камней, подчеркивают вашу утонченность и неповторимость. Идеальное для ценителей фантазийных сюжетов и изысканных украшений, это кольцо станет вашим верным спутником в любом образе, добавляя нотку таинственности и романтики. Носите его каждый день или храните для особых случаев - оно всегда будет напоминанием о вашем внутреннем свете и элегантности.'
    },
    {
        name: 'Кольцо золотое с бриллиантом',
        imageSrc: [
            './src/img/the_ring_1_carat_1.jpg',
            './src/img/the_ring_1_carat_2.jpg',
            './src/img/the_ring_1_carat_3.jpg'
        ],
        modelPath: '',
        description: 'Металл: золото. Масса: 20 г',
        totalDescription: 'Представляем вам шедевр ювелирного искусства - золотое кольцо с бриллиантом весом 3 карата. Этот восхитительный аксессуар сочетает в себе классическую элегантность и современное изящество. Великолепный бриллиант сияет ярким блеском, привлекая внимание и восхищенные взгляды. Уникальный дизайн кольца подчеркивает красоту драгоценного камня, создавая гармоничный и роскошный образ. Идеальное для знаменательных событий и особых моментов, это кольцо станет символом вашей любви и преданности. Подарите себе или своим близким частичку вечного великолепия, которое будет радовать вас своей непревзойденной красотой каждый день.'
    },
    {
        name: 'Кольцо старинное инкрустированное',
        imageSrc: [
            './src/img/iron_ring_1.jpg',
            './src/img/iron_ring_2.jpg',
            './src/img/iron_ring_3.jpg'
        ],
        modelPath: '',
        description: 'Металл: ювелирная сталь. Масса: 41 г',
        totalDescription: 'Откройте для себя очарование древности с этим старинным стальным кольцом, украшенным тремя изысканно инкрустированными камнями. Каждая деталь этого уникального аксессуара пропитана историей и мастерством. Прочная сталь символизирует силу и стойкость, а камни, сияющие в гармоничном трио, добавляют нотки роскоши и тайны. Это кольцо идеально подойдет тем, кто ценит винтажную элегантность и стремится подчеркнуть свою индивидуальность. Носите его как символ своего уникального стиля и безупречного вкуса. Пусть этот драгоценный артефакт станет вашим личным талисманом, приносящим удачу и вдохновение.'
    },
]

function RingsGrid() {
    return (
        <Flex
            direction={['column', 'row']} // Определяем направление для адаптивности
            flexWrap="wrap" // Обертываемость для адаптивного переноса элементов
            justifyContent="center" // Выравнивание по центру
            alignItems="center" // Выравнивание по центру
            gap={4} // Отступ между элементами
        >
            {ringsRepository.map((item, index) => (
                <Box key={index} width={['100%', '45%', '40%', '32%']}> {/* Для мобильных устройств ширина 100%, на более широких экранах изменяем ширину */}
                    <RingCard ring={item} />
                </Box>
            ))}
        </Flex>
    );
}

export default RingsGrid